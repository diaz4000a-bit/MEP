import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import { formatearDuracion, formatearHora } from "@/lib/jornadas";
import { computeAvance } from "@/lib/tareas";
import type { EstadoTarea, Jornada, Proyecto, Tarea } from "@/types";

// Colores del tema oscuro de la app (globals.css) — el informe es un documento
// autocontenido con tema claro, así que no puede leer las variables CSS de la app.
const COLOR_ESTADO: Record<EstadoTarea, string> = {
  "Sin iniciar": "#64748b",
  "En progreso": "#4f8ef7",
  "En revisión": "#a855f7",
  Completada: "#22c55e",
  Bloqueada: "#ef4444",
};

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function esc(valor: unknown): string {
  return String(valor ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase() || "?";
}

interface FilaActividad {
  tarea: string;
  zona: string;
  etapa: string;
  inicio: number;
  fin: number;
  delta: number;
  estado: EstadoTarea;
  hora: number;
  registros: number;
}

// Reúne, por responsable, las tareas con actividad (avance/estado) en una fecha dada.
// Para cada tarea con varios registros ese día se reporta el movimiento neto del día.
function recolectarActividadDelDia(tareas: Tarea[], fecha: string): Record<string, FilaActividad[]> {
  const inicioMs = new Date(fecha + "T00:00:00").getTime();
  const finMs = new Date(fecha + "T23:59:59.999").getTime();
  const mapa: Record<string, FilaActividad[]> = {};

  for (const t of tareas) {
    const h = t.historial ?? [];
    const dia: { de: number; a: number; e: EstadoTarea; f: number }[] = [];
    // i === 0 es la foto inicial de creación/importación de la tarea, no trabajo real —
    // si se cuenta, toda tarea creada/importada hoy aparece como "trabajada" aunque nadie
    // la haya tocado (ver bug real: proyectos importados con 60+ tareas inundando el informe).
    h.forEach((x, i) => {
      if (i > 0 && x.f >= inicioMs && x.f <= finMs) dia.push({ de: h[i - 1].p, a: x.p, e: x.e, f: x.f });
    });
    if (dia.length === 0) continue;

    const inicio = dia[0].de;
    const ultimo = dia[dia.length - 1];
    const resp = t.responsable || "Sin asignar";
    (mapa[resp] ??= []).push({
      tarea: t.nombre,
      zona: t.zona || "",
      etapa: t.etapa || "",
      inicio,
      fin: ultimo.a,
      delta: ultimo.a - inicio,
      estado: ultimo.e,
      hora: ultimo.f,
      registros: dia.length,
    });
  }

  for (const filas of Object.values(mapa)) filas.sort((a, b) => a.hora - b.hora);
  return mapa;
}

function construirInformeHTML(
  proyecto: Proyecto,
  tareas: Tarea[],
  fecha: string,
  respFiltro: string,
  actividad: Record<string, FilaActividad[]>,
  jornadasPorResp: Map<string, Jornada[]>,
): string {
  let responsables = Object.keys(actividad).sort();
  if (respFiltro) responsables = responsables.filter((r) => r === respFiltro);

  const fechaLarga = new Date(fecha + "T00:00:00").toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const generado = new Date().toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const pillEstado = (e: EstadoTarea) => `<span class="pill" style="background:${COLOR_ESTADO[e] ?? "#64748b"}">${esc(e)}</span>`;
  const deltaTxt = (d: number) => (d > 0 ? "+" + d : d < 0 ? String(d) : "0");
  const jornadaTxt = (r: string) => {
    const js = jornadasPorResp.get(r) ?? [];
    if (js.length === 0) return '<span class="sinjornada">Sin jornada registrada este día</span>';
    return js
      .map((j) => {
        const salida = j.salida ? formatearHora(j.salida) : "abierta";
        const dur = j.duracionMin != null ? ` · ${formatearDuracion(j.duracionMin)}` : "";
        return `${formatearHora(j.entrada)} → ${salida}${dur}`;
      })
      .join(" · ");
  };

  let totalTareas = 0;
  let totalRegistros = 0;
  responsables.forEach((r) => {
    totalTareas += actividad[r].length;
    actividad[r].forEach((row) => (totalRegistros += row.registros));
  });

  let body: string;
  if (responsables.length === 0) {
    body = `<div class="empty">No se registró actividad ${respFiltro ? `de <b>${esc(respFiltro)}</b> ` : ""}en esta fecha.</div>`;
  } else {
    body = responsables
      .map((r) => {
        const rows = actividad[r];
        const avanceAcum = rows.reduce((s, x) => s + Math.max(0, x.delta), 0);
        const totReg = rows.reduce((s, x) => s + x.registros, 0);
        return (
          `<section class="worker">` +
          `<div class="worker-head">` +
          `<div class="avatar">${esc(iniciales(r))}</div>` +
          `<div><div class="wname">${esc(r)}</div>` +
          `<div class="wsub">${rows.length} tarea(s) con avance · +${avanceAcum} puntos acumulados · ${totReg} registro(s)</div>` +
          `<div class="wjornada">Jornada: ${jornadaTxt(r)}</div></div>` +
          `</div>` +
          `<table><thead><tr>` +
          `<th class="tcol">Tarea</th><th>Zona</th><th>Etapa</th><th class="acol">Avance</th><th>Estado</th><th class="hcol">Hora</th>` +
          `</tr></thead><tbody>` +
          rows
            .map(
              (x) =>
                `<tr>` +
                `<td class="tcol">${esc(x.tarea)}</td>` +
                `<td>${x.zona ? esc(x.zona) : "—"}</td>` +
                `<td>${x.etapa ? esc(x.etapa) : "—"}</td>` +
                `<td class="acol">${x.inicio}% → <b>${x.fin}%</b> <span class="delta ${x.delta > 0 ? "up" : x.delta < 0 ? "down" : ""}">${deltaTxt(x.delta)}</span></td>` +
                `<td>${pillEstado(x.estado)}</td>` +
                `<td class="hcol">${formatearHora(x.hora)}</td>` +
                `</tr>`,
            )
            .join("") +
          `</tbody></table>` +
          `</section>`
        );
      })
      .join("");
  }

  // Pie: trabajadores asignados sin actividad ese día (solo en el informe de "Todos")
  let pie = "";
  if (!respFiltro) {
    const sinActividad = [...new Set(tareas.map((t) => t.responsable).filter(Boolean))]
      .filter((r) => !actividad[r])
      .sort();
    if (sinActividad.length) {
      pie = `<div class="sinact"><b>Sin actividad registrada hoy:</b> ${sinActividad.map(esc).join(", ")}</div>`;
    }
  }

  const titulo = `Informe diario - ${proyecto.nombre} - ${fecha}`;

  return (
    `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">` +
    `<title>${esc(titulo)}</title>` +
    `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">` +
    `<style>` +
    `@page{size:A4;margin:14mm}*{box-sizing:border-box}` +
    `body{font-family:'Inter',-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#1f2430;margin:0;padding:28px 30px;background:#fff;font-size:12.5px;line-height:1.45}` +
    `.report-head{border-bottom:2px solid #1f2430;padding-bottom:14px;margin-bottom:18px}` +
    `.report-head h1{margin:0 0 2px;font-size:20px}` +
    `.report-head .proj{font-size:14px;font-weight:600;color:#4f8ef7}` +
    `.report-head .meta{color:#6b7280;font-size:12px;margin-top:4px;text-transform:capitalize}` +
    `.summary{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px}` +
    `.chip{background:#f1f5fb;border:1px solid #e2e8f0;border-radius:8px;padding:8px 12px;font-size:11px;color:#475569}` +
    `.chip b{display:block;font-size:17px;color:#1f2430}` +
    `.worker{margin-bottom:18px;break-inside:avoid}` +
    `.worker-head{display:flex;align-items:center;gap:10px;margin-bottom:8px}` +
    `.avatar{width:34px;height:34px;border-radius:50%;background:#4f8ef7;color:#fff;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;flex:0 0 auto}` +
    `.wname{font-size:14px;font-weight:700}.wsub{font-size:11px;color:#6b7280}.wjornada{font-size:11px;color:#334155;margin-top:2px}` +
    `table{width:100%;border-collapse:collapse;font-size:11.5px}` +
    `th{text-align:left;background:#f1f5fb;border-bottom:1px solid #cbd5e1;padding:6px 8px;font-size:10px;text-transform:uppercase;letter-spacing:.03em;color:#475569}` +
    `td{padding:6px 8px;border-bottom:1px solid #eef2f7;vertical-align:top}tr{break-inside:avoid}` +
    `.tcol{width:34%}.acol{white-space:nowrap}.hcol{white-space:nowrap;text-align:right;color:#6b7280}` +
    `.pill{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;color:#fff}` +
    `.delta{font-weight:700;margin-left:4px}.delta.up{color:#16a34a}.delta.down{color:#dc2626}` +
    `.empty{padding:30px;text-align:center;color:#6b7280;background:#f8fafc;border-radius:10px}` +
    `.sinact{margin-top:14px;padding:10px 12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;font-size:11.5px;color:#9a3412}` +
    `.sinjornada{color:#9ca3af;font-style:italic}` +
    `.report-foot{margin-top:24px;padding-top:10px;border-top:1px solid #e2e8f0;font-size:10.5px;color:#9ca3af;text-align:center}` +
    `.no-print{position:fixed;top:14px;right:14px}` +
    `.no-print button{font-family:inherit;font-size:13px;padding:8px 14px;border:none;border-radius:8px;background:#4f8ef7;color:#fff;cursor:pointer}` +
    `@media print{.no-print{display:none}body{padding:0}}` +
    `</style></head><body>` +
    `<div class="no-print"><button onclick="window.print()">Imprimir / Guardar PDF</button></div>` +
    `<div class="report-head">` +
    `<h1>Informe de progreso diario</h1>` +
    `<div class="proj">${esc(proyecto.nombre)}${proyecto.cliente ? " · " + esc(proyecto.cliente) : ""}</div>` +
    `<div class="meta">${esc(fechaLarga)}${respFiltro ? " · Trabajador: " + esc(respFiltro) : " · Todos los trabajadores"}</div>` +
    `</div>` +
    `<div class="summary">` +
    `<div class="chip">Avance del proyecto<b>${computeAvance(tareas)}%</b></div>` +
    `<div class="chip">Trabajadores activos<b>${responsables.length}</b></div>` +
    `<div class="chip">Tareas con avance<b>${totalTareas}</b></div>` +
    `<div class="chip">Registros del día<b>${totalRegistros}</b></div>` +
    `</div>` +
    body +
    pie +
    `<div class="report-foot">Generado el ${esc(generado)} · MEP Manager</div>` +
    `<script>window.onload=function(){setTimeout(function(){window.print();},450);};</script>` +
    `</body></html>`
  );
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirUsuario();

  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get("fecha") || new Date().toISOString().slice(0, 10);
  const respFiltro = searchParams.get("resp") || "";

  const proyectoRef = adminDb.doc(`proyectos/${id}`);
  const [proyectoSnap, tareasSnap, jornadasSnap] = await Promise.all([
    proyectoRef.get(),
    proyectoRef.collection("tareas").get(),
    adminDb.collection("jornadas").where("proyectoId", "==", id).where("fecha", "==", fecha).get(),
  ]);

  if (!proyectoSnap.exists) {
    return new Response("Proyecto no encontrado", { status: 404 });
  }

  const proyecto = proyectoSnap.data() as Proyecto;
  const tareas = tareasSnap.docs.map((d) => d.data() as Tarea);
  const jornadas = jornadasSnap.docs.map((d) => d.data() as Jornada);

  const jornadasPorResp = new Map<string, Jornada[]>();
  for (const j of jornadas) {
    const lista = jornadasPorResp.get(j.usuarioNombre) ?? [];
    lista.push(j);
    jornadasPorResp.set(j.usuarioNombre, lista);
  }
  for (const lista of jornadasPorResp.values()) lista.sort((a, b) => a.entrada - b.entrada);

  const actividad = recolectarActividadDelDia(tareas, fecha);
  const html = construirInformeHTML(proyecto, tareas, fecha, respFiltro, actividad, jornadasPorResp);

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
