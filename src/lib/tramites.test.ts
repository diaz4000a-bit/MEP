import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  contarPorEstado,
  contarPorSemaforo,
  esTramiteCerrado,
  estaVencido,
  fechaLimiteSugerida,
  metricasTramites,
  motivoSemaforo,
  normalizarEstadoImportado,
  semaforoProyecto,
  semaforoProyectoResumen,
  semaforoTramite,
} from "./tramites";
import type { EstadoTramite } from "@/types";

// 15:00 UTC = 10:00 en Bogotá, así que el día calendario de Bogotá es el 11 de agosto.
// Fijar la hora importa: con la hora por defecto (00:00 UTC) el día de Bogotá sería el 10.
const HOY = "2026-08-11";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(Date.parse(`${HOY}T15:00:00Z`));
});

afterEach(() => {
  vi.useRealTimers();
});

const tramite = (estado: EstadoTramite, fechaLimite: string) => ({ estado, fechaLimite });

describe("semaforoTramite", () => {
  it("es verde cuando falta más de la ventana de alerta", () => {
    expect(semaforoTramite(tramite("Radicado", "2026-09-30"))).toBe("verde");
  });

  it("es verde para un trámite aprobado aunque su fecha límite ya pasara", () => {
    expect(semaforoTramite(tramite("Aprobado", "2026-01-01"))).toBe("verde");
  });

  it("es ámbar dentro de los 7 días previos, incluido el mismo día de vencimiento", () => {
    expect(semaforoTramite(tramite("Radicado", "2026-08-18"))).toBe("amarillo");
    expect(semaforoTramite(tramite("Radicado", HOY))).toBe("amarillo");
  });

  it("es rojo cuando la fecha límite ya pasó y el trámite sigue abierto", () => {
    expect(semaforoTramite(tramite("Radicado", "2026-08-10"))).toBe("rojo");
  });

  it("es rojo si la entidad lo rechazó, sin mirar fechas", () => {
    expect(semaforoTramite(tramite("Rechazado", "2027-01-01"))).toBe("rojo");
  });

  it("nunca es verde en subsanación, aunque sobre plazo", () => {
    expect(semaforoTramite(tramite("Subsanación", "2026-12-31"))).toBe("amarillo");
  });

  it("es ámbar sin fecha comprometida: no hay nada que garantice que llegue a tiempo", () => {
    expect(semaforoTramite(tramite("Sin iniciar", ""))).toBe("amarillo");
  });

  it("es ámbar y no rojo si la fecha guardada es basura", () => {
    expect(semaforoTramite(tramite("Radicado", "no-es-una-fecha"))).toBe("amarillo");
  });
});

describe("semaforoProyecto", () => {
  it("es null sin trámites: no es 'al día', es que no se ha gestionado nada", () => {
    expect(semaforoProyecto([])).toBeNull();
  });

  it("manda el peor trámite, no el promedio", () => {
    const cartera = [
      tramite("Aprobado", "2026-01-01"),
      tramite("Radicado", "2026-12-01"),
      tramite("Radicado", "2026-08-01"), // vencido
    ];
    expect(semaforoProyecto(cartera)).toBe("rojo");
  });

  it("es ámbar cuando lo peor que hay es un trámite por vencer", () => {
    expect(semaforoProyecto([tramite("Aprobado", ""), tramite("Radicado", "2026-08-13")])).toBe("amarillo");
  });

  it("es verde solo si todos están al día", () => {
    expect(semaforoProyecto([tramite("Aprobado", ""), tramite("Radicado", "2026-11-30")])).toBe("verde");
  });
});

describe("estaVencido", () => {
  it("ignora los trámites ya resueltos", () => {
    expect(estaVencido(tramite("Aprobado", "2026-01-01"))).toBe(false);
    expect(estaVencido(tramite("Rechazado", "2026-01-01"))).toBe(false);
  });

  it("es true solo con trámite abierto y fecha pasada", () => {
    expect(estaVencido(tramite("Radicado", "2026-08-10"))).toBe(true);
    expect(estaVencido(tramite("Radicado", HOY))).toBe(false);
    expect(estaVencido(tramite("Radicado", ""))).toBe(false);
  });
});

describe("esTramiteCerrado", () => {
  it("solo aprobado y rechazado cierran el trámite", () => {
    expect(esTramiteCerrado({ estado: "Aprobado" })).toBe(true);
    expect(esTramiteCerrado({ estado: "Rechazado" })).toBe(true);
    expect(esTramiteCerrado({ estado: "Subsanación" })).toBe(false);
  });
});

describe("contarPorEstado", () => {
  it("devuelve los seis estados aunque estén en cero, en el orden del catálogo", () => {
    const filas = contarPorEstado([{ estado: "Radicado" }, { estado: "Radicado" }, { estado: "Aprobado" }]);
    expect(filas).toHaveLength(6);
    expect(filas[0].estado).toBe("Sin iniciar");
    expect(filas.find((f) => f.estado === "Radicado")?.total).toBe(2);
    expect(filas.find((f) => f.estado === "Aprobado")?.total).toBe(1);
    expect(filas.find((f) => f.estado === "Rechazado")?.total).toBe(0);
  });
});

describe("contarPorSemaforo", () => {
  it("reparte cada trámite en un único color", () => {
    const cartera = [
      tramite("Aprobado", ""), // verde
      tramite("Radicado", "2026-12-01"), // verde
      tramite("Subsanación", "2026-12-01"), // ámbar
      tramite("Radicado", "2026-08-01"), // rojo
    ];
    expect(contarPorSemaforo(cartera)).toEqual({ verde: 2, amarillo: 1, rojo: 1 });
  });
});

describe("fechaLimiteSugerida", () => {
  it("suma el plazo de referencia del tipo a la fecha de radicación", () => {
    // Disponibilidad de servicio: 15 días de referencia.
    expect(fechaLimiteSugerida("Disponibilidad de servicio", "2026-08-11")).toBe("2026-08-26");
  });

  it("cruza el cambio de mes sin descuadrarse", () => {
    // Certificación RETIE: 20 días.
    expect(fechaLimiteSugerida("Certificación RETIE", "2026-08-20")).toBe("2026-09-09");
  });

  it("es vacío si el tipo no tiene plazo de referencia o falta la fecha", () => {
    expect(fechaLimiteSugerida("Otro", "2026-08-11")).toBe("");
    expect(fechaLimiteSugerida("Certificación RETIE", "")).toBe("");
    expect(fechaLimiteSugerida("Certificación RETIE", "no-es-fecha")).toBe("");
  });
});

describe("motivoSemaforo", () => {
  it("explica el rojo antes que el ámbar cuando hay de los dos", () => {
    const cartera = [tramite("Radicado", "2026-08-01"), tramite("Subsanación", "2026-12-01")];
    expect(motivoSemaforo(cartera)).toContain("vencido");
  });

  it("distingue 'sin trámites' de 'todo al día'", () => {
    expect(motivoSemaforo([])).toContain("Sin trámites");
    expect(motivoSemaforo([tramite("Radicado", "2026-12-01")])).toContain("Ningún trámite vencido");
  });
});

describe("metricasTramites", () => {
  it("cuenta abiertos, rechazados y los que están en ámbar por naturaleza", () => {
    const cartera = [
      tramite("Aprobado", "2026-01-01"),
      tramite("Rechazado", "2026-01-01"),
      tramite("Subsanación", "2026-12-01"),
      tramite("Radicado", ""),
      tramite("Radicado", "2026-09-15"),
    ];
    expect(metricasTramites(cartera)).toEqual({
      totalTramites: 5,
      tramitesAbiertos: 3,
      tramitesRechazados: 1,
      tramitesEnAlerta: 2, // la subsanación y el que no tiene fecha
      proximoVencimiento: "2026-09-15",
    });
  });

  it("ignora las fechas de los trámites ya cerrados al buscar el próximo vencimiento", () => {
    const cartera = [tramite("Aprobado", "2026-08-01"), tramite("Radicado", "2026-10-01")];
    expect(metricasTramites(cartera).proximoVencimiento).toBe("2026-10-01");
  });

  it("deja el próximo vencimiento vacío si ningún trámite abierto tiene fecha", () => {
    expect(metricasTramites([tramite("Radicado", "")]).proximoVencimiento).toBe("");
  });
});

describe("semaforoProyectoResumen", () => {
  it("es null para un proyecto sin trámites o anterior a la sección", () => {
    expect(semaforoProyectoResumen({})).toBeNull();
    expect(semaforoProyectoResumen({ totalTramites: 0 })).toBeNull();
  });

  // Las métricas denormalizadas y la lectura completa son dos caminos al mismo color.
  // Si se separan, la lista de proyectos miente y nadie lo nota hasta que se pierde un plazo.
  it.each([
    ["todo al día", [tramite("Radicado", "2026-12-01"), tramite("Aprobado", "")]],
    ["uno vencido", [tramite("Radicado", "2026-08-01"), tramite("Radicado", "2026-12-01")]],
    ["uno rechazado", [tramite("Rechazado", "2026-12-01"), tramite("Radicado", "2026-12-01")]],
    ["uno por vencer", [tramite("Radicado", "2026-08-14"), tramite("Radicado", "2026-12-01")]],
    ["uno en subsanación", [tramite("Subsanación", "2026-12-01")]],
    ["uno sin fecha", [tramite("Radicado", "")]],
    ["cerrados vencidos", [tramite("Aprobado", "2026-01-01")]],
    ["vacío", []],
  ])("coincide con semaforoProyecto: %s", (_caso, cartera) => {
    expect(semaforoProyectoResumen(metricasTramites(cartera))).toBe(semaforoProyecto(cartera));
  });
});

describe("normalizarEstadoImportado", () => {
  it("degrada a 'En preparación' un estado radicado sin fecha de radicación", () => {
    // El archivo afirma que se radicó pero no dice cuándo. Inventar la fecha seria fabricar
    // un dato; conservar el estado dejaria un documento que la propia app no deja editar.
    expect(normalizarEstadoImportado("Radicado", "")).toBe("En preparación");
    expect(normalizarEstadoImportado("Subsanación", "")).toBe("En preparación");
    expect(normalizarEstadoImportado("Aprobado", "")).toBe("En preparación");
    expect(normalizarEstadoImportado("Rechazado", "")).toBe("En preparación");
  });

  it("respeta el estado cuando la fecha de radicación viene en el archivo", () => {
    expect(normalizarEstadoImportado("Radicado", "2026-07-01")).toBe("Radicado");
    expect(normalizarEstadoImportado("Aprobado", "2026-07-01")).toBe("Aprobado");
  });

  it("no toca los estados previos a la radicación, que no necesitan fecha", () => {
    expect(normalizarEstadoImportado("Sin iniciar", "")).toBe("Sin iniciar");
    expect(normalizarEstadoImportado("En preparación", "")).toBe("En preparación");
  });

  it("deja el documento importado cumpliendo el invariante que exige el validador", () => {
    // La propiedad que importa: tras normalizar, ningún estado radicado se queda sin fecha.
    const casos: [EstadoTramite, string][] = [
      ["Radicado", ""],
      ["Aprobado", ""],
      ["Radicado", "2026-07-01"],
    ];
    for (const [estado, fecha] of casos) {
      const normalizado = normalizarEstadoImportado(estado, fecha);
      const exigeFecha = ["Radicado", "Subsanación", "Aprobado", "Rechazado"].includes(normalizado);
      expect(exigeFecha && !fecha).toBe(false);
    }
  });
});
