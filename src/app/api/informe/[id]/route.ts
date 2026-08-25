import { puede } from "@/lib/auth/roles";
import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import { type FilaActividad, recolectarActividadDelDia } from "@/lib/informe";
import { formatearDuracion, formatearHora } from "@/lib/jornadas";
import { computeAvance } from "@/lib/tareas";
import { ZONA, fechaBogota, fechaLarga, fechaLegible } from "@/lib/tiempo";
import {
  DIAS_ALERTA_TRAMITE,
  diasRestantes,
  esTramiteCerrado,
  ETIQUETA_SEMAFORO,
  semaforoProyecto,
  semaforoTramite,
  type Semaforo,
} from "@/lib/tramites";
import type { EstadoTarea, EstadoTramite, Jornada, Proyecto, Tarea, Tramite } from "@/types";

// Colores del tema oscuro de la app (globals.css) — el informe es un documento
// autocontenido con tema claro, así que no puede leer las variables CSS de la app.
const COLOR_ESTADO: Record<EstadoTarea, string> = {
  "Sin iniciar": "#64748b",
  "En progreso": "#4f8ef7",
  "En revisión": "#a855f7",
  Completada: "#22c55e",
  Bloqueada: "#ef4444",
};

const COLOR_SEMAFORO_INFORME: Record<Semaforo, string> = {
  verde: "#22c55e",
  amarillo: "#f59e0b",
  rojo: "#ef4444",
};

const COLOR_ESTADO_TRAMITE: Record<EstadoTramite, string> = {
  "Sin iniciar": "#64748b",
  "En preparación": "#4f8ef7",
  Radicado: "#a855f7",
  Subsanación: "#f59e0b",
  Aprobado: "#22c55e",
  Rechazado: "#ef4444",
};

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function esc(valor: unknown): string {
  return String(valor ?? "").replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase() || "?";
}

/**
 * Bloque de tramites del informe.
 *
 * A diferencia del resto del documento -que reporta la actividad de UN dia- el estado de un
 * tramite es el de HOY: una radicacion vencida lo sigue estando aunque se reimprima el
 * informe del martes pasado. Por eso el bloque va rotulado con esa salvedad.
 *
 * Solo se listan los tramites ABIERTOS: los resueltos ya no bloquean nada y solo alargarian
 * el informe. El contador del encabezado si los cuenta todos.
 */
function construirBloqueTramites(tramites: Tramite[]): string {
  if (tramites.length === 0) return "";

  const orden: Semaforo[] = ["rojo", "amarillo", "verde"];
  const abiertos = tramites
    .filter((t) => !esTramiteCerrado(t))
    .sort((a, b) => {
      const porColor = orden.indexOf(semaforoTramite(a)) - orden.indexOf(semaforoTramite(b));
      if (porColor !== 0) return porColor;
      return (a.fechaLimite || "9999-12-31").localeCompare(b.fechaLimite || "9999-12-31");
    });

  const cabecera = '<section class="tramites"><h2>Tramites y permisos</h2>';
  if (abiertos.length === 0) {
    return cabecera + '<div class="empty">Los ' + tramites.length + " tramite(s) del proyecto estan resueltos.</div></section>";
  }

  const plazo = (t: Tramite) => {
    const d = diasRestantes(t);
    if (d === null) return '<span class="tr-alerta">Sin fecha comprometida</span>';
    if (d < 0) return '<span class="tr-critico">Vencido hace ' + Math.abs(d) + " d</span>";
    if (d === 0) return '<span class="tr-critico">Vence hoy</span>';
    if (d <= DIAS_ALERTA_TRAMITE) return '<span class="tr-alerta">Faltan ' + d + " d</span>";
    return "Faltan " + d + " d";
  };

  const filas = abiertos
    .map((t) => {
      const color = semaforoTramite(t);
      return (
        "<tr>" +
        '<td><span class="luz" style="background:' +
        COLOR_SEMAFORO_INFORME[color] +
        '" title="' +
        esc(ETIQUETA_SEMAFORO[color]) +
        '"></span></td>' +
        '<td class="tcol">' +
        esc(t.nombre) +
        '<div class="tr-sub">' +
        esc(t.entidad || "Sin entidad") +
        (t.radicado ? " &middot; Radicado " + esc(t.radicado) : "") +
        "</div></td>" +
        '<td><span class="pill" style="background:' +
        (COLOR_ESTADO_TRAMITE[t.estado] ?? "#64748b") +
        '">' +
        esc(t.estado) +
        "</span></td>" +
        "<td>" +
        (t.fechaLimite ? esc(fechaLegible(t.fechaLimite)) : "—") +
        "</td>" +
        '<td class="hcol">' +
        plazo(t) +
        "</td>" +
        "<td>" +
        esc(t.responsable || "—") +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  return (
    cabecera +
    '<div class="tr-nota">Estado a la fecha de generacion de este informe, no a la fecha reportada arriba.</div>' +
    "<table><thead><tr>" +
    '<th class="lcol"></th><th class="tcol">Tramite</th><th>Estado</th><th>Vence</th><th class="hcol">Plazo</th><th>Responsable</th>' +
    "</tr></thead><tbody>" +
    filas +
    "</tbody></table></section>"
  );
}

function construirInformeHTML(
  proyecto: Proyecto,
  tareas: Tarea[],
  fecha: string,
  respFiltro: string,
  actividad: Record<string, FilaActividad[]>,
  jornadasPorResp: Map<string, Jornada[]>,
  tramites: Tramite[],
): string {
  let responsables = Object.keys(actividad).sort();
  if (respFiltro) responsables = responsables.filter((r) => r === respFiltro);

  const fechaLargaTxt = fechaLarga(fecha);
  const generado = new Date().toLocaleString("es-CO", {
    timeZone: ZONA,
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
        // `esc` también aquí: aunque estos campos los escribe el servidor, el informe es el
        // único sitio donde datos de Firestore acaban como HTML, así que toda interpolación
        // que produzca texto pasa por el escape. Los numéricos se garantizan numéricos en
        // origen (`sanearHistorial`), que es la defensa equivalente para ese caso.
        const salida = j.salida ? esc(formatearHora(j.salida)) : "abierta";
        const dur = j.duracionMin != null ? ` · ${esc(formatearDuracion(j.duracionMin))}` : "";
        return `${esc(formatearHora(j.entrada))} → ${salida}${dur}`;
      })
      .join(" · ");
  };

  let totalTareas = 0;
  let totalRegistros = 0;
  responsables.forEach((r) => {
    totalTareas += actividad[r].length;
    actividad[r].forEach((row) => (totalRegistros += row.registros));
  });

  // El semaforo resume la cartera en una palabra; el detalle va en su propio bloque.
  const colorTramites = semaforoProyecto(tramites);
  const chipTramites = colorTramites
    ? '<div class="chip">Tramites<b style="color:' +
      COLOR_SEMAFORO_INFORME[colorTramites] +
      '">' +
      esc(ETIQUETA_SEMAFORO[colorTramites]) +
      "</b></div>"
    : "";

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
                `<td class="hcol">${esc(formatearHora(x.hora))}</td>` +
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
    `.tramites{margin-top:22px;break-inside:avoid}` +
    `.tramites h2{font-size:14px;margin:0 0 4px}` +
    `.tr-nota{font-size:10.5px;color:#6b7280;margin-bottom:8px}` +
    `.tr-sub{font-size:10.5px;color:#6b7280;margin-top:2px}` +
    `.lcol{width:18px}.luz{display:inline-block;width:9px;height:9px;border-radius:50%}` +
    `.tr-critico{color:#dc2626;font-weight:700}.tr-alerta{color:#b45309;font-weight:600}` +
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
    `<div class="meta">${esc(fechaLargaTxt)}${respFiltro ? " · Trabajador: " + esc(respFiltro) : " · Todos los trabajadores"}</div>` +
    `</div>` +
    `<div class="summary">` +
    `<div class="chip">Avance del proyecto<b>${computeAvance(tareas)}%</b></div>` +
    `<div class="chip">Trabajadores activos<b>${responsables.length}</b></div>` +
    `<div class="chip">Tareas con avance<b>${totalTareas}</b></div>` +
    `<div class="chip">Registros del día<b>${totalRegistros}</b></div>` +
    chipTramites +
    `</div>` +
    body +
    construirBloqueTramites(tramites) +
    pie +
    `<div class="report-foot">Generado el ${esc(generado)} · MEP Manager</div>` +
    `<script>window.onload=function(){setTimeout(function(){window.print();},450);};</script>` +
    `</body></html>`
  );
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await exigirUsuario();

  const { searchParams } = new URL(request.url);
  const fecha = searchParams.get("fecha") || fechaBogota();
  const respFiltro = searchParams.get("resp") || "";

  const proyectoRef = adminDb.doc(`proyectos/${id}`);
  const [proyectoSnap, tareasSnap, tramitesSnap, jornadasSnap] = await Promise.all([
    proyectoRef.get(),
    proyectoRef.collection("tareas").get(),
    proyectoRef.collection("tramites").get(),
    adminDb.collection("jornadas").where("proyectoId", "==", id).where("fecha", "==", fecha).get(),
  ]);

  if (!proyectoSnap.exists) {
    return new Response("Proyecto no encontrado", { status: 404 });
  }

  const proyecto = proyectoSnap.data() as Proyecto;
  const tareas = tareasSnap.docs.map((d) => d.data() as Tarea);
  const tramites = tramitesSnap.docs.map((d) => d.data() as Tramite);
  // Las jornadas del equipo son dato reservado a gestores (misma regla que /jornadas):
  // quien no pueda verlas recibe el informe con su propia jornada únicamente.
  const todasLasJornadas = jornadasSnap.docs.map((d) => d.data() as Jornada);
  const jornadas = puede(usuario.rol, "verJornadasAjenas")
    ? todasLasJornadas
    : todasLasJornadas.filter((j) => j.uid === usuario.uid);

  const jornadasPorResp = new Map<string, Jornada[]>();
  for (const j of jornadas) {
    const lista = jornadasPorResp.get(j.usuarioNombre) ?? [];
    lista.push(j);
    jornadasPorResp.set(j.usuarioNombre, lista);
  }
  for (const lista of jornadasPorResp.values()) lista.sort((a, b) => a.entrada - b.entrada);

  const actividad = recolectarActividadDelDia(tareas, fecha);
  const html = construirInformeHTML(proyecto, tareas, fecha, respFiltro, actividad, jornadasPorResp, tramites);

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
