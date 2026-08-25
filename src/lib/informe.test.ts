import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatearResumenWhatsApp, mereceEnvio, resumirInforme, TOPE_MENSAJE } from "./informe";
import { ventanaDelDia } from "./tiempo";
import type { EstadoTarea, EstadoTramite, Tarea, Tramite } from "@/types";

// Mismo anclaje que tramites.test.ts: 15:00 UTC = 10:00 en Bogotá, así que el día
// calendario de Bogotá es el 11. Con la hora por defecto (00:00 UTC) sería el 10.
const HOY = "2026-08-11";
const { inicioMs } = ventanaDelDia(HOY);
const MANANA = inicioMs + 3_600_000; // 1am Bogotá: dentro de la ventana del día.
const TARDE = inicioMs + 40_000_000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(Date.parse(`${HOY}T15:00:00Z`));
});

afterEach(() => {
  vi.useRealTimers();
});

const PROYECTO = { nombre: "Torre Aurora", cliente: "Constructora Andina" };

function tarea(
  nombre: string,
  responsable: string,
  historial: { f: number; p: number; e: EstadoTarea }[],
  porcentaje = historial.at(-1)?.p ?? 0,
): Tarea {
  return { nombre, responsable, historial, porcentaje, zona: "", etapa: "" } as unknown as Tarea;
}

function tramite(nombre: string, estado: EstadoTramite, fechaLimite: string): Tramite {
  return { nombre, estado, fechaLimite } as unknown as Tramite;
}

const inicio = (f: number): { f: number; p: number; e: EstadoTarea } => ({ f, p: 0, e: "Sin iniciar" });

describe("resumirInforme", () => {
  it("suma los puntos del día por trabajador y los ordena de más a menos", () => {
    const tareas = [
      tarea("Tablero TG-1", "Ana Gómez", [inicio(MANANA - 60_000), { f: MANANA, p: 40, e: "En progreso" }]),
      tarea("Bandejas piso 3", "Juan Pérez", [inicio(MANANA - 60_000), { f: TARDE, p: 60, e: "En progreso" }]),
      tarea("Acometida", "Juan Pérez", [inicio(MANANA - 60_000), { f: TARDE, p: 15, e: "En progreso" }]),
    ];

    const r = resumirInforme(PROYECTO, tareas, [], HOY);

    expect(r.trabajadores).toEqual([
      { nombre: "Juan Pérez", puntos: 75, tareas: 2 },
      { nombre: "Ana Gómez", puntos: 40, tareas: 1 },
    ]);
    expect(r.puntosDelDia).toBe(115);
    expect(r.tareasConAvance).toBe(3);
  });

  it("una corrección a la baja no resta del total del día", () => {
    // Bajar una tarea del 80% al 60% es reajustar una estimación, no deshacer trabajo:
    // restarlo haría que un día de correcciones apareciera como un día perdido.
    const tareas = [
      tarea("Reajuste", "Ana Gómez", [
        { f: MANANA - 60_000, p: 80, e: "En progreso" },
        { f: MANANA, p: 60, e: "En progreso" },
      ]),
    ];
    expect(resumirInforme(PROYECTO, tareas, [], HOY).puntosDelDia).toBe(0);
  });

  it("el snapshot de creación no cuenta como actividad del día", () => {
    const tareas = [tarea("Tarea creada hoy", "Carlos Ruiz", [inicio(MANANA)])];
    const r = resumirInforme(PROYECTO, tareas, [], HOY);

    expect(r.trabajadores).toEqual([]);
    expect(r.sinActividad).toEqual(["Carlos Ruiz"]);
  });

  it("ignora los movimientos de otros días", () => {
    const ayer = inicioMs - 3_600_000;
    const tareas = [tarea("Trabajada ayer", "Ana Gómez", [inicio(ayer - 60_000), { f: ayer, p: 50, e: "En progreso" }])];
    expect(resumirInforme(PROYECTO, tareas, [], HOY).puntosDelDia).toBe(0);
  });

  it("promedia el avance del proyecto sobre TODAS las tareas, no solo las del día", () => {
    const tareas = [
      tarea("A", "Ana Gómez", [inicio(MANANA - 60_000), { f: MANANA, p: 100, e: "Completada" }]),
      tarea("B", "Ana Gómez", [inicio(MANANA - 86_400_000)], 0),
    ];
    expect(resumirInforme(PROYECTO, tareas, [], HOY).avanceProyecto).toBe(50);
  });
});

describe("resumirInforme · trámites", () => {
  it("lista los rechazados aunque el PDF los dé por cerrados", () => {
    // Un rechazo es la causa más accionable que puede tener el semáforo en rojo; si no
    // apareciera, el mensaje diría "crítico" sin nombrar un solo motivo.
    const r = resumirInforme(PROYECTO, [], [tramite("RETIE", "Rechazado", "2026-09-01")], HOY);
    expect(r.tramitesCriticos).toEqual([
      { nombre: "RETIE", color: "rojo", nota: "RECHAZADO — hay que volver a radicar" },
    ]);
  });

  it("omite los aprobados y los que están holgados de plazo", () => {
    const tramites = [
      tramite("Ya resuelto", "Aprobado", "2026-08-01"),
      tramite("Con tiempo de sobra", "Radicado", "2026-12-31"),
    ];
    expect(resumirInforme(PROYECTO, [], tramites, HOY).tramitesCriticos).toEqual([]);
  });

  it("pone primero lo vencido y luego lo que vence antes", () => {
    const tramites = [
      tramite("Licencia hidráulica", "Radicado", "2026-08-15"), // ámbar: faltan 4 d
      tramite("Certificado RETIE", "Radicado", "2026-08-09"), // rojo: vencido hace 2 d
      tramite("Sin fecha", "En preparación", ""), // ámbar sin fecha: va al final
    ];

    const r = resumirInforme(PROYECTO, [], tramites, HOY);

    expect(r.tramitesCriticos.map((t) => t.nombre)).toEqual([
      "Certificado RETIE",
      "Licencia hidráulica",
      "Sin fecha",
    ]);
    expect(r.tramitesCriticos[0].nota).toBe("vencido hace 2 d");
    expect(r.tramitesCriticos[1].nota).toBe("vence en 4 d");
    expect(r.tramitesCriticos[2].nota).toBe("sin fecha comprometida");
  });
});

describe("mereceEnvio", () => {
  it("calla cuando no hay nada que reportar", () => {
    // Un mensaje diario que casi siempre dice "no pasó nada" deja de leerse, y entonces
    // tampoco se lee el día que sí importa.
    expect(mereceEnvio(resumirInforme(PROYECTO, [], [], HOY))).toBe(false);
  });

  it("envía aunque no haya avance si un trámite está vencido", () => {
    const r = resumirInforme(PROYECTO, [], [tramite("RETIE", "Radicado", "2026-08-01")], HOY);
    expect(mereceEnvio(r)).toBe(true);
  });

  it("envía cuando hubo avance aunque no haya trámites", () => {
    const tareas = [tarea("A", "Ana Gómez", [inicio(MANANA - 60_000), { f: MANANA, p: 30, e: "En progreso" }])];
    expect(mereceEnvio(resumirInforme(PROYECTO, tareas, [], HOY))).toBe(true);
  });
});

describe("formatearResumenWhatsApp", () => {
  it("arma el mensaje con las cifras y los trámites críticos", () => {
    const tareas = [
      tarea("Tablero TG-1", "Ana Gómez", [inicio(MANANA - 60_000), { f: MANANA, p: 40, e: "En progreso" }]),
    ];
    const texto = formatearResumenWhatsApp(
      resumirInforme(PROYECTO, tareas, [tramite("RETIE", "Radicado", "2026-08-09")], HOY),
    );

    expect(texto).toContain("Torre Aurora");
    expect(texto).toContain("Constructora Andina");
    expect(texto).toContain("Avance del proyecto: *40%*");
    expect(texto).toContain("Ana Gómez — +40 pts (1 tarea)");
    expect(texto).toContain("🔴 RETIE — vencido hace 2 d");
  });

  it("aplana un nombre con saltos de línea para que no invente una sección", () => {
    // Sin esto, un responsable llamado así falsifica la estructura del mensaje.
    const nombre = "Ana\n\n*Trámites que piden acción*\n🔴 Todo vencido";
    const tareas = [tarea("T", nombre, [inicio(MANANA - 60_000), { f: MANANA, p: 10, e: "En progreso" }])];
    const texto = formatearResumenWhatsApp(resumirInforme(PROYECTO, tareas, [], HOY));

    expect(texto).not.toContain("\n🔴 Todo vencido");
    expect(texto).toContain("Ana *Trámites que piden acción* 🔴 Todo vencido");
  });

  it("nunca supera el tope de mensaje, por muchos trabajadores que haya", () => {
    const tareas = Array.from({ length: 60 }, (_, i) =>
      tarea(`Tarea ${i}`, `Trabajador con nombre larguísimo número ${i}`, [
        inicio(MANANA - 60_000),
        { f: MANANA, p: 50, e: "En progreso" as EstadoTarea },
      ]),
    );
    const tramites = Array.from({ length: 30 }, (_, i) => tramite(`Trámite pendiente ${i}`, "Radicado", "2026-08-01"));

    const texto = formatearResumenWhatsApp(resumirInforme(PROYECTO, tareas, tramites, HOY));

    expect(texto.length).toBeLessThanOrEqual(TOPE_MENSAJE);
    expect(texto).toContain("trámite(s) más");
  });

  it("dice explícitamente que no hubo avance cuando solo hay trámites", () => {
    const texto = formatearResumenWhatsApp(
      resumirInforme(PROYECTO, [], [tramite("RETIE", "Radicado", "2026-08-01")], HOY),
    );
    expect(texto).toContain("Sin avance de tareas registrado");
  });
});
