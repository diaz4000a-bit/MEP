import { describe, expect, it } from "vitest";
import {
  agruparPorFecha,
  construirEventos,
  desplazar,
  diasDeSemana,
  esFecha,
  estaVencido,
  filtrarEventos,
  inicioSemana,
  matrizMes,
  mesesDelAnio,
  rangoVista,
  sumarDias,
  sumarMeses,
} from "@/lib/calendario";
import type { Proyecto, Tarea } from "@/types";

// Proyectos y tareas sintéticos: solo los campos que lee el calendario.
function proyecto(parcial: Partial<Proyecto>): Proyecto {
  return {
    id: "p1",
    nombre: "Torre A",
    cliente: "Constructora X",
    fechaInicio: "2026-01-15",
    fechaEntrega: "2026-09-30",
    disciplina: "Eléctrica",
    software: "Revit",
    estado: "En progreso",
    notas: "",
    zonas: [],
    creado: 0,
    actualizado: 0,
    totalTareas: 0,
    tareasCompletadas: 0,
    avanceTotal: 0,
    ...parcial,
  };
}

function tarea(parcial: Partial<Tarea>): Tarea {
  return {
    id: "t1",
    proyectoId: "p1",
    plantillaId: null,
    nombre: "Modelado de tableros",
    categoria: "Tableros",
    grupo: null,
    subgrupo: null,
    zona: null,
    etapa: null,
    responsableUid: null,
    responsable: "Carlos Pérez",
    prioridad: "Alta",
    estado: "En progreso",
    porcentaje: 0,
    fechaInicio: "2026-08-01",
    fechaLimite: "2026-08-20",
    fechaCompletada: "",
    horasEstimadas: 0,
    horasReales: 0,
    comentarios: "",
    bloqueadoPor: "",
    verificacion: {},
    historial: [],
    actualizado: 0,
    ...parcial,
  };
}

describe("esFecha", () => {
  it("acepta solo 'YYYY-MM-DD' con día real", () => {
    expect(esFecha("2026-08-23")).toBe(true);
    expect(esFecha("2026-02-29")).toBe(false); // 2026 no es bisiesto
    expect(esFecha("2024-02-29")).toBe(true);
    expect(esFecha("2026-02-30")).toBe(false);
    expect(esFecha("2026-13-01")).toBe(false);
    expect(esFecha("")).toBe(false);
    expect(esFecha("23/08/2026")).toBe(false);
  });
});

describe("aritmética de días", () => {
  it("suma cruzando mes y año", () => {
    expect(sumarDias("2026-08-31", 1)).toBe("2026-09-01");
    expect(sumarDias("2027-01-01", -1)).toBe("2026-12-31");
    expect(sumarDias("2024-02-28", 1)).toBe("2024-02-29");
  });

  it("suma meses recortando al último día del mes destino", () => {
    expect(sumarMeses("2024-01-31", 1)).toBe("2024-02-29");
    expect(sumarMeses("2026-01-31", 1)).toBe("2026-02-28");
    expect(sumarMeses("2026-12-15", 1)).toBe("2027-01-15");
    expect(sumarMeses("2026-01-15", -1)).toBe("2025-12-15");
  });
});

describe("semana", () => {
  it("arranca en lunes y deja el lunes fijo", () => {
    // 2026-08-23 es domingo → su semana empieza el lunes 17.
    expect(inicioSemana("2026-08-23")).toBe("2026-08-17");
    expect(inicioSemana("2026-08-17")).toBe("2026-08-17");
    expect(inicioSemana("2026-08-22")).toBe("2026-08-17");
  });

  it("devuelve 7 días consecutivos", () => {
    const dias = diasDeSemana("2026-08-23");
    expect(dias).toHaveLength(7);
    expect(dias[0]).toBe("2026-08-17");
    expect(dias[6]).toBe("2026-08-23");
  });
});

describe("matrizMes", () => {
  const semanas = matrizMes("2026-08-10");

  it("siempre son 6 filas de 7 días", () => {
    expect(semanas).toHaveLength(6);
    for (const semana of semanas) expect(semana).toHaveLength(7);
  });

  it("empieza en el lunes de la semana del día 1 y es continua", () => {
    // 2026-08-01 es sábado → la rejilla arranca el lunes 27 de julio.
    expect(semanas[0][0]).toBe("2026-07-27");
    const plana = semanas.flat();
    for (let i = 1; i < plana.length; i++) {
      expect(plana[i]).toBe(sumarDias(plana[i - 1], 1));
    }
  });

  it("contiene todos los días del mes", () => {
    const plana = new Set(semanas.flat());
    for (let d = 1; d <= 31; d++) {
      expect(plana.has(`2026-08-${String(d).padStart(2, "0")}`)).toBe(true);
    }
  });

  it("cubre meses que empiezan en lunes sin dejar la primera fila fuera del mes", () => {
    // 2026-06-01 es lunes: la rejilla debe arrancar ese mismo día.
    expect(matrizMes("2026-06-01")[0][0]).toBe("2026-06-01");
  });
});

describe("mesesDelAnio", () => {
  it("devuelve los 12 meses del año del ancla", () => {
    const meses = mesesDelAnio("2026-08-23");
    expect(meses).toHaveLength(12);
    expect(meses[0].mes).toBe("2026-01-01");
    expect(meses[11].mes).toBe("2026-12-01");
    expect(meses[0].semanas).toHaveLength(6);
  });
});

describe("rangoVista", () => {
  it("acota cada vista a su ventana de días", () => {
    expect(rangoVista("dia", "2026-08-23")).toEqual({ desde: "2026-08-23", hasta: "2026-08-23" });
    expect(rangoVista("semana", "2026-08-23")).toEqual({ desde: "2026-08-17", hasta: "2026-08-23" });
    expect(rangoVista("mes", "2026-08-23")).toEqual({ desde: "2026-08-01", hasta: "2026-08-31" });
    expect(rangoVista("anio", "2026-08-23")).toEqual({ desde: "2026-01-01", hasta: "2026-12-31" });
    expect(rangoVista("mes", "2024-02-10").hasta).toBe("2024-02-29");
  });
});

describe("desplazar", () => {
  it("mueve una unidad de la vista", () => {
    expect(desplazar("dia", "2026-08-31", 1)).toBe("2026-09-01");
    expect(desplazar("semana", "2026-08-23", 1)).toBe("2026-08-30");
    expect(desplazar("mes", "2026-08-23", 1)).toBe("2026-09-01");
    expect(desplazar("anio", "2026-08-23", -1)).toBe("2025-01-01");
  });

  it("es reversible en mes: ida y vuelta cae en el mismo mes", () => {
    // El caso que rompía con aritmética de día exacto: 31 de enero.
    const ida = desplazar("mes", "2026-01-31", 1);
    expect(desplazar("mes", ida, -1).slice(0, 7)).toBe("2026-01");
  });
});

describe("construirEventos", () => {
  const proyectos = [
    proyecto({ id: "p1", nombre: "Torre A", fechaInicio: "2026-01-15", fechaEntrega: "2026-09-30" }),
    proyecto({ id: "p2", nombre: "Torre B", fechaInicio: "", fechaEntrega: "2026-09-30", estado: "Entregado" }),
    proyecto({ id: "p3", nombre: "Sin fechas", fechaInicio: "", fechaEntrega: "" }),
  ];
  const tareas = [
    tarea({ id: "t1", proyectoId: "p1", fechaLimite: "2026-08-20" }),
    tarea({ id: "t2", proyectoId: "p1", fechaLimite: "", nombre: "Sin límite" }),
    tarea({ id: "t3", proyectoId: "zzz", fechaLimite: "2026-08-20", nombre: "Proyecto borrado" }),
  ];
  const eventos = construirEventos(proyectos, tareas);

  it("descarta fechas vacías o inválidas", () => {
    expect(eventos.some((e) => e.proyectoId === "p3")).toBe(false);
    expect(eventos.some((e) => e.titulo === "Sin límite")).toBe(false);
    expect(eventos.filter((e) => e.tipo === "inicio")).toHaveLength(1);
  });

  it("marca completado según el estado", () => {
    expect(eventos.find((e) => e.id === "entrega:p2")?.completado).toBe(true);
    expect(eventos.find((e) => e.id === "entrega:p1")?.completado).toBe(false);
  });

  it("no rompe si la tarea apunta a un proyecto que ya no existe", () => {
    expect(eventos.find((e) => e.id === "tarea:zzz:t3")?.proyectoNombre).toBe("Proyecto");
  });

  it("ordena por fecha y deja las entregas antes que las tareas del mismo día", () => {
    const fechas = eventos.map((e) => e.fecha);
    expect([...fechas].sort()).toEqual(fechas);
    const delDia = eventos.filter((e) => e.fecha === "2026-09-30");
    expect(delDia.every((e) => e.tipo === "entrega")).toBe(true);
  });

  it("apunta a la ruta de detalle correcta", () => {
    expect(eventos.find((e) => e.id === "entrega:p1")?.href).toBe("/proyectos/p1");
    expect(eventos.find((e) => e.id === "tarea:p1:t1")?.href).toBe("/proyectos/p1/tarea/t1");
  });
});

describe("filtrarEventos y agruparPorFecha", () => {
  const eventos = construirEventos(
    [proyecto({ id: "p1" }), proyecto({ id: "p2", nombre: "Torre B", fechaEntrega: "2026-10-01" })],
    [tarea({ id: "t1", fechaLimite: "2026-09-30" })],
  );

  it("filtra por proyecto y por tipo", () => {
    expect(filtrarEventos(eventos, { proyectoId: "p2" }).every((e) => e.proyectoId === "p2")).toBe(true);
    expect(filtrarEventos(eventos, { tipos: ["entrega"] }).every((e) => e.tipo === "entrega")).toBe(true);
    expect(filtrarEventos(eventos, {})).toHaveLength(eventos.length);
  });

  it("agrupa los eventos que caen el mismo día", () => {
    const porFecha = agruparPorFecha(eventos);
    expect(porFecha.get("2026-09-30")).toHaveLength(2); // entrega de p1 + tarea t1
  });
});

describe("estaVencido", () => {
  const [entrega] = construirEventos([proyecto({ fechaEntrega: "2026-08-01", fechaInicio: "" })], []);

  it("solo marca vencido lo pasado y sin completar", () => {
    expect(estaVencido(entrega, "2026-08-23")).toBe(true);
    expect(estaVencido(entrega, "2026-08-01")).toBe(false);
    expect(estaVencido({ ...entrega, completado: true }, "2026-08-23")).toBe(false);
  });

  it("nunca marca vencido un inicio de proyecto", () => {
    const [inicio] = construirEventos([proyecto({ fechaInicio: "2020-01-01", fechaEntrega: "" })], []);
    expect(estaVencido(inicio, "2026-08-23")).toBe(false);
  });
});
