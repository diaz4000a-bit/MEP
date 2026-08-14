import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/sesion", () => ({ exigirUsuario: vi.fn() }));

import {
  anularJornada,
  cambiarProyectoJornada,
  registrarEntrada,
  registrarSalida,
} from "@/app/(app)/jornadas/actions";
import { guardarHorario } from "@/app/(app)/jornadas/horario-actions";
import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import { horarioVacio } from "@/lib/horarios";
import { fechaBogota } from "@/lib/tiempo";
import type { HorarioSemanal, Jornada, Rol } from "@/types";
import { limpiarFirestore, seedProyecto, usuarioFalso } from "./helpers/proyectos";

/**
 * Prueba jornadas/actions.ts (reloj de entrada/salida) y horario-actions.ts contra el
 * emulador real. `registrarEntrada`/`registrarSalida`/`anularJornada` no tienen matriz de
 * roles para el propio dueño (cualquiera marca su propia hora); el único control de rol es
 * `verJornadasAjenas` para que un gestor pueda cerrar/anular la jornada de otro.
 */

beforeEach(async () => {
  await limpiarFirestore();
  vi.mocked(exigirUsuario).mockReset();
});

function comoRol(rol: Rol, uid = `${rol}-uid`) {
  const usuario = usuarioFalso(uid, rol);
  vi.mocked(exigirUsuario).mockResolvedValue(usuario);
  return usuario;
}

async function jornadaUnica(): Promise<Jornada> {
  const snap = await adminDb.collection("jornadas").get();
  return snap.docs[0].data() as Jornada;
}

describe("registrarEntrada", () => {
  it("crea una jornada abierta con la fecha de Bogotá derivada del servidor", async () => {
    await seedProyecto("p1", "Torre Norte");
    comoRol("ingeniero");

    await registrarEntrada({ proyectoId: "p1" });

    const jornada = await jornadaUnica();
    expect(jornada.estado).toBe("abierta");
    expect(jornada.proyectoNombre).toBe("Torre Norte");
    expect(jornada.fecha).toBe(fechaBogota());
    expect(jornada.salida).toBeNull();
  });

  it("rechaza una segunda entrada si ya hay una jornada abierta", async () => {
    await seedProyecto("p1");
    comoRol("ingeniero");
    await registrarEntrada({ proyectoId: "p1" });

    await expect(registrarEntrada({ proyectoId: "p1" })).rejects.toThrow("Ya tienes una jornada abierta");
  });

  it("rechaza registrar entrada en un proyecto que no existe", async () => {
    comoRol("ingeniero");
    await expect(registrarEntrada({ proyectoId: "no-existe" })).rejects.toThrow("El proyecto ya no existe");
  });
});

describe("cambiarProyectoJornada", () => {
  it("cierra la jornada abierta (con duracionMin calculado) y abre una nueva en el otro proyecto", async () => {
    await seedProyecto("p1", "Proyecto 1");
    await seedProyecto("p2", "Proyecto 2");
    comoRol("ingeniero");
    await registrarEntrada({ proyectoId: "p1" });

    await cambiarProyectoJornada({ proyectoId: "p2" });

    const snap = await adminDb.collection("jornadas").get();
    const jornadas = snap.docs.map((d) => d.data() as Jornada);
    expect(jornadas).toHaveLength(2);
    const cerrada = jornadas.find((j) => j.proyectoId === "p1")!;
    const abierta = jornadas.find((j) => j.proyectoId === "p2")!;
    expect(cerrada.estado).toBe("cerrada");
    expect(cerrada.duracionMin).not.toBeNull();
    expect(abierta.estado).toBe("abierta");
  });

  it("rechaza cambiar de proyecto si no hay jornada abierta", async () => {
    await seedProyecto("p1");
    comoRol("ingeniero");
    await expect(cambiarProyectoJornada({ proyectoId: "p1" })).rejects.toThrow("No tienes una jornada abierta");
  });

  it("rechaza 'cambiar' al mismo proyecto en el que ya está", async () => {
    await seedProyecto("p1");
    comoRol("ingeniero");
    await registrarEntrada({ proyectoId: "p1" });

    await expect(cambiarProyectoJornada({ proyectoId: "p1" })).rejects.toThrow("Ya estás trabajando en ese proyecto");
  });
});

describe("registrarSalida", () => {
  it("el dueño cierra su propia jornada y se calcula duracionMin", async () => {
    await seedProyecto("p1");
    comoRol("ingeniero", "ing-1");
    await registrarEntrada({ proyectoId: "p1" });
    const { id } = await jornadaUnica();

    await registrarSalida({ jornadaId: id });

    const jornada = await jornadaUnica();
    expect(jornada.estado).toBe("cerrada");
    expect(jornada.duracionMin).not.toBeNull();
  });

  it("un gestor puede cerrar la jornada de otro; un compañero sin verJornadasAjenas no puede", async () => {
    await seedProyecto("p1");
    comoRol("ingeniero", "ing-1");
    await registrarEntrada({ proyectoId: "p1" });
    const { id } = await jornadaUnica();

    comoRol("ingeniero", "ing-2");
    await expect(registrarSalida({ jornadaId: id })).rejects.toThrow("No tienes permiso");

    comoRol("coordinador");
    await registrarSalida({ jornadaId: id });
    expect((await jornadaUnica()).estado).toBe("cerrada");
  });

  it("rechaza cerrar una jornada que ya está cerrada", async () => {
    await seedProyecto("p1");
    comoRol("ingeniero", "ing-1");
    await registrarEntrada({ proyectoId: "p1" });
    const { id } = await jornadaUnica();
    await registrarSalida({ jornadaId: id });

    await expect(registrarSalida({ jornadaId: id })).rejects.toThrow("ya está cerrada");
  });

  it("rechaza una hora de salida anterior a la de entrada", async () => {
    await seedProyecto("p1");
    comoRol("ingeniero", "ing-1");
    await registrarEntrada({ proyectoId: "p1" });
    const { id, entrada } = await jornadaUnica();

    await expect(registrarSalida({ jornadaId: id, horaSalida: entrada - 60_000 })).rejects.toThrow(
      "no puede ser anterior",
    );
  });

  it("rechaza una hora de salida más de 2 minutos en el futuro", async () => {
    await seedProyecto("p1");
    comoRol("ingeniero", "ing-1");
    await registrarEntrada({ proyectoId: "p1" });
    const { id } = await jornadaUnica();

    await expect(
      registrarSalida({ jornadaId: id, horaSalida: Date.now() + 10 * 60_000 }),
    ).rejects.toThrow("no puede estar en el futuro");
  });
});

describe("anularJornada", () => {
  it("anula la jornada propia y registra el motivo en las notas", async () => {
    await seedProyecto("p1");
    comoRol("ingeniero", "ing-1");
    await registrarEntrada({ proyectoId: "p1" });
    const { id } = await jornadaUnica();

    await anularJornada(id, "Entrada por error");

    const jornada = await jornadaUnica();
    expect(jornada.estado).toBe("anulada");
    expect(jornada.notas).toContain("Entrada por error");
  });

  it("rechaza anular sin motivo", async () => {
    await seedProyecto("p1");
    comoRol("ingeniero", "ing-1");
    await registrarEntrada({ proyectoId: "p1" });
    const { id } = await jornadaUnica();

    await expect(anularJornada(id, "   ")).rejects.toThrow("Indica el motivo");
  });

  it("un compañero sin verJornadasAjenas no puede anular la jornada de otro", async () => {
    await seedProyecto("p1");
    comoRol("ingeniero", "ing-1");
    await registrarEntrada({ proyectoId: "p1" });
    const { id } = await jornadaUnica();

    comoRol("modelador", "otro-modelador");
    await expect(anularJornada(id, "motivo")).rejects.toThrow("No tienes permiso");
  });
});

describe("guardarHorario", () => {
  function diasValidos(): HorarioSemanal["dias"] {
    return {
      ...horarioVacio(),
      lunes: { manana: { inicio: "08:00", fin: "12:00" }, tarde: { inicio: "13:00", fin: "17:00" } },
    };
  }

  it("el dueño guarda su propio horario", async () => {
    comoRol("ingeniero", "ing-1");
    await guardarHorario("ing-1", diasValidos());

    const snap = await adminDb.doc("horarios/ing-1").get();
    expect((snap.data() as HorarioSemanal).dias.lunes.manana).toEqual({ inicio: "08:00", fin: "12:00" });
  });

  it("un gestor puede guardar el horario de otro; un compañero sin gestionarEquipo no puede", async () => {
    comoRol("ingeniero", "ing-2");
    await expect(guardarHorario("ing-1", diasValidos())).rejects.toThrow("No tienes permiso");

    comoRol("admin");
    await guardarHorario("ing-1", diasValidos());
    expect((await adminDb.doc("horarios/ing-1").get()).exists).toBe(true);
  });

  it("rechaza un bloque con la hora final antes de la inicial", async () => {
    comoRol("ingeniero", "ing-1");
    const dias = { ...horarioVacio(), lunes: { manana: { inicio: "18:00", fin: "09:00" }, tarde: null } };

    await expect(guardarHorario("ing-1", dias)).rejects.toThrow("no tiene un formato válido");
  });
});
