import { afterEach, describe, expect, it, vi } from "vitest";
import { colorAvance, computeAvance, estaProxima, estaVencida } from "./tareas";

afterEach(() => {
  vi.useRealTimers();
});

describe("computeAvance", () => {
  it("es 0 sin tareas", () => {
    expect(computeAvance([])).toBe(0);
  });

  it("promedia el porcentaje redondeando", () => {
    expect(computeAvance([{ porcentaje: 50 }, { porcentaje: 100 }])).toBe(75);
    expect(computeAvance([{ porcentaje: 1 }, { porcentaje: 1 }, { porcentaje: 2 }])).toBe(1);
  });

  it("trata un porcentaje no numerico como 0", () => {
    // @ts-expect-error - simula un dato corrupto de Firestore
    expect(computeAvance([{ porcentaje: undefined }, { porcentaje: 100 }])).toBe(50);
  });
});

describe("estaVencida", () => {
  it("es true cuando la fecha limite ya paso y la tarea sigue abierta", () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse("2026-08-11T15:00:00Z")); // 2026-08-11 en Bogota
    expect(estaVencida({ fechaLimite: "2026-08-10", estado: "En progreso" })).toBe(true);
  });

  it("es false si la tarea ya esta completada, aunque este vencida", () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse("2026-08-11T15:00:00Z"));
    expect(estaVencida({ fechaLimite: "2026-08-10", estado: "Completada" })).toBe(false);
  });

  it("es false sin fecha limite, o si la fecha limite es hoy o futura", () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse("2026-08-11T15:00:00Z"));
    expect(estaVencida({ fechaLimite: "", estado: "En progreso" })).toBe(false);
    expect(estaVencida({ fechaLimite: "2026-08-11", estado: "En progreso" })).toBe(false);
    expect(estaVencida({ fechaLimite: "2026-08-12", estado: "En progreso" })).toBe(false);
  });
});

describe("estaProxima", () => {
  it("es true entre hoy y 3 dias hacia adelante", () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse("2026-08-11T15:00:00Z"));
    expect(estaProxima({ fechaLimite: "2026-08-11", estado: "En progreso" })).toBe(true);
    expect(estaProxima({ fechaLimite: "2026-08-14", estado: "En progreso" })).toBe(true);
    expect(estaProxima({ fechaLimite: "2026-08-15", estado: "En progreso" })).toBe(false);
  });

  it("es false para fechas ya vencidas o tareas completadas", () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse("2026-08-11T15:00:00Z"));
    expect(estaProxima({ fechaLimite: "2026-08-10", estado: "En progreso" })).toBe(false);
    expect(estaProxima({ fechaLimite: "2026-08-12", estado: "Completada" })).toBe(false);
  });
});

describe("colorAvance", () => {
  it("mapea el porcentaje a la escala de color en los limites de cada banda", () => {
    expect(colorAvance(0)).toBe("bg-estado-bloqueada");
    expect(colorAvance(30)).toBe("bg-estado-bloqueada");
    expect(colorAvance(31)).toBe("bg-prioridad-media");
    expect(colorAvance(60)).toBe("bg-prioridad-media");
    expect(colorAvance(61)).toBe("bg-primary");
    expect(colorAvance(90)).toBe("bg-primary");
    expect(colorAvance(91)).toBe("bg-estado-completada");
    expect(colorAvance(100)).toBe("bg-estado-completada");
  });
});
