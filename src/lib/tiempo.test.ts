import { afterEach, describe, expect, it, vi } from "vitest";
import {
  diasHasta,
  fechaBogota,
  fechaDeTimestamp,
  fechaHoraLegible,
  fechaLarga,
  fechaLegible,
  haceTiempo,
  ventanaDelDia,
} from "./tiempo";

afterEach(() => {
  vi.useRealTimers();
});

describe("fechaBogota", () => {
  it("usa el dia calendario de Bogota, no el de UTC", () => {
    // 2026-08-11T00:00:00Z es apenas 2026-08-10 19:00 en Bogota (UTC-5): sigue siendo el dia anterior.
    expect(fechaBogota(Date.parse("2026-08-11T00:00:00Z"))).toBe("2026-08-10");
    // A partir de las 05:00 UTC ya es medianoche en Bogota: cruza al dia siguiente.
    expect(fechaBogota(Date.parse("2026-08-11T05:00:00Z"))).toBe("2026-08-11");
    expect(fechaBogota(Date.parse("2026-08-11T04:59:59Z"))).toBe("2026-08-10");
  });

  it("usa Date.now() cuando no se pasa timestamp", () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse("2026-03-01T12:00:00Z"));
    expect(fechaBogota()).toBe("2026-03-01");
  });
});

describe("ventanaDelDia", () => {
  it("delimita el dia de Bogota en tiempo real, no el dia UTC", () => {
    const { inicioMs, finMs } = ventanaDelDia("2026-08-11");
    expect(new Date(inicioMs).toISOString()).toBe("2026-08-11T05:00:00.000Z");
    expect(new Date(finMs).toISOString()).toBe("2026-08-12T04:59:59.999Z");
  });

  it("todo instante dentro de la ventana pertenece al mismo dia de Bogota (round-trip)", () => {
    const { inicioMs, finMs } = ventanaDelDia("2026-08-11");
    expect(fechaBogota(inicioMs)).toBe("2026-08-11");
    expect(fechaBogota(finMs)).toBe("2026-08-11");
    // Un ms antes/despues de la ventana ya pertenece al dia vecino.
    expect(fechaBogota(inicioMs - 1)).toBe("2026-08-10");
    expect(fechaBogota(finMs + 1)).toBe("2026-08-12");
  });
});

describe("diasHasta", () => {
  it("es 0 el mismo dia de Bogota, aunque la hora UTC ya sea el dia siguiente", () => {
    // 2026-08-11T04:30:00Z = 2026-08-10 23:30 en Bogota: "hoy" sigue siendo el 10.
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse("2026-08-11T04:30:00Z"));
    expect(diasHasta("2026-08-10")).toBe(0);
    expect(diasHasta("2026-08-11")).toBe(1);
  });

  it("cuenta dias futuros en positivo y pasados en negativo", () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse("2026-08-11T15:00:00Z")); // 2026-08-11 10:00 Bogota
    expect(diasHasta("2026-08-14")).toBe(3);
    expect(diasHasta("2026-08-01")).toBe(-10);
  });

  it("devuelve null para fechas vacias o invalidas", () => {
    expect(diasHasta("")).toBeNull();
    expect(diasHasta("no-es-una-fecha")).toBeNull();
  });
});

describe("fechaLegible", () => {
  it("formatea una fecha YYYY-MM-DD sin reconvertir de zona horaria", () => {
    expect(fechaLegible("2026-08-11")).toBe("11 de ago de 2026");
  });

  it("devuelve un guion largo para fecha vacia o invalida", () => {
    expect(fechaLegible("")).toBe("—");
    expect(fechaLegible("no-es-una-fecha")).toBe("—");
  });
});

describe("fechaLarga", () => {
  it("formatea con dia de la semana en español", () => {
    expect(fechaLarga("2026-08-11")).toBe("martes, 11 de agosto de 2026");
  });

  it("devuelve la fecha cruda si es invalida", () => {
    expect(fechaLarga("no-es-una-fecha")).toBe("no-es-una-fecha");
  });
});

describe("fechaHoraLegible", () => {
  it("formatea un timestamp en hora de Bogota", () => {
    // 2026-08-11T20:15:00Z = 2026-08-11 15:15 en Bogota.
    expect(fechaHoraLegible(Date.parse("2026-08-11T20:15:00Z"))).toBe("11 de ago, 03:15 p. m.");
  });
});

describe("fechaDeTimestamp", () => {
  it("formatea un timestamp en hora de Bogota", () => {
    expect(fechaDeTimestamp(Date.parse("2026-08-11T20:15:00Z"))).toBe("11 de ago de 2026");
  });

  it("devuelve un guion largo para timestamp 0/vacio", () => {
    expect(fechaDeTimestamp(0)).toBe("—");
  });
});

describe("haceTiempo", () => {
  it("escala de minutos a meses", () => {
    vi.useFakeTimers();
    const ahora = Date.parse("2026-08-11T12:00:00Z");
    vi.setSystemTime(ahora);

    expect(haceTiempo(ahora)).toBe("justo ahora");
    expect(haceTiempo(ahora - 5 * 60_000)).toBe("hace 5 min");
    expect(haceTiempo(ahora - 3 * 3_600_000)).toBe("hace 3 h");
    expect(haceTiempo(ahora - 2 * 86_400_000)).toBe("hace 2 d");
    expect(haceTiempo(ahora - 90 * 86_400_000)).toBe("hace 3 meses");
    expect(haceTiempo(ahora - 30 * 86_400_000)).toBe("hace 1 mes");
  });
});
