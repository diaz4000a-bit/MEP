import { afterEach, describe, expect, it, vi } from "vitest";
import { esJornadaColgada, fechaLocalHoy, formatearDuracion, formatearHora } from "./jornadas";

afterEach(() => {
  vi.useRealTimers();
});

describe("formatearDuracion", () => {
  it("solo minutos por debajo de una hora", () => {
    expect(formatearDuracion(0)).toBe("0 min");
    expect(formatearDuracion(45)).toBe("45 min");
  });

  it("solo horas cuando los minutos son exactos", () => {
    expect(formatearDuracion(60)).toBe("1 h");
    expect(formatearDuracion(180)).toBe("3 h");
  });

  it("horas y minutos combinados, redondeando", () => {
    expect(formatearDuracion(90)).toBe("1 h 30 min");
    expect(formatearDuracion(125.7)).toBe("2 h 6 min");
  });
});

describe("esJornadaColgada", () => {
  it("es false antes de las 16 horas y true despues", () => {
    vi.useFakeTimers();
    const entrada = Date.parse("2026-08-11T08:00:00Z");
    vi.setSystemTime(entrada + 15 * 60 * 60 * 1000);
    expect(esJornadaColgada(entrada)).toBe(false);

    vi.setSystemTime(entrada + 17 * 60 * 60 * 1000);
    expect(esJornadaColgada(entrada)).toBe(true);
  });
});

describe("formatearHora", () => {
  it("formatea un timestamp en hora de Bogota, no la del runtime", () => {
    // 2026-08-11T20:15:00Z = 15:15 en Bogota (UTC-5), sin importar la zona del proceso que corre el test.
    expect(formatearHora(Date.parse("2026-08-11T20:15:00Z"))).toBe("03:15 p. m.");
  });
});

describe("fechaLocalHoy", () => {
  it("delega en el dia calendario de Bogota", () => {
    vi.useFakeTimers();
    // 2026-08-11T02:00:00Z = 2026-08-10 21:00 en Bogota: sigue siendo el dia anterior.
    vi.setSystemTime(Date.parse("2026-08-11T02:00:00Z"));
    expect(fechaLocalHoy()).toBe("2026-08-10");
  });
});
