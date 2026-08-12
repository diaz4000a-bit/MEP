import type { BloqueHorario, DiaHorario, DiaSemana, HorarioSemanal } from "@/types";

export const DIAS_SEMANA: { key: DiaSemana; label: string }[] = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
];

// index 0 = domingo (getDay()) — no forma parte de DiaSemana, se trata como día libre.
const DIA_POR_INDICE: (DiaSemana | null)[] = [null, "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

export function diaSemanaDeFecha(fecha: string): DiaSemana | null {
  return DIA_POR_INDICE[new Date(fecha + "T00:00:00").getDay()];
}

export function horarioVacio(): HorarioSemanal["dias"] {
  const dia = (): DiaHorario => ({ manana: null, tarde: null });
  return { lunes: dia(), martes: dia(), miercoles: dia(), jueves: dia(), viernes: dia(), sabado: dia() };
}

function minutosBloque(b: BloqueHorario | null): number {
  if (!b || !b.inicio || !b.fin) return 0;
  const [hi, mi] = b.inicio.split(":").map(Number);
  const [hf, mf] = b.fin.split(":").map(Number);
  const min = hf * 60 + mf - (hi * 60 + mi);
  return min > 0 ? min : 0;
}

export function minutosProgramadosDia(dia: DiaHorario | undefined): number {
  if (!dia) return 0;
  return minutosBloque(dia.manana) + minutosBloque(dia.tarde);
}

export function minutosProgramadosSemana(dias: HorarioSemanal["dias"]): number {
  return DIAS_SEMANA.reduce((s, d) => s + minutosProgramadosDia(dias[d.key]), 0);
}

const HORA_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function bloqueValido(v: unknown): boolean {
  if (v === null) return true;
  if (typeof v !== "object") return false;
  const b = v as Record<string, unknown>;
  return typeof b.inicio === "string" && HORA_RE.test(b.inicio) && typeof b.fin === "string" && HORA_RE.test(b.fin);
}

/**
 * Valida la forma de `dias` (los 6 días de la semana, cada bloque `null` o `{ inicio, fin }`
 * en `HH:mm`) antes de guardarlo o de confiar en un documento leído de Firestore. `guardarHorario`
 * recibe el payload tal cual lo manda el cliente; sin esto, un `inicio`/`fin` que no sea
 * "HH:mm" pasa intacto a `minutosBloque`, que revienta con un `TypeError` al hacer `.split(":")`.
 */
export function validarDias(valor: unknown): HorarioSemanal["dias"] | null {
  if (typeof valor !== "object" || valor === null) return null;
  const v = valor as Record<string, unknown>;
  const dias = {} as HorarioSemanal["dias"];
  for (const { key } of DIAS_SEMANA) {
    const dia = v[key];
    if (typeof dia !== "object" || dia === null) return null;
    const d = dia as Record<string, unknown>;
    if (!bloqueValido(d.manana) || !bloqueValido(d.tarde)) return null;
    dias[key] = {
      manana: (d.manana ?? null) as BloqueHorario | null,
      tarde: (d.tarde ?? null) as BloqueHorario | null,
    };
  }
  return dias;
}

/** Fechas 'YYYY-MM-DD' entre desde y hasta, ambas incluidas. */
export function rangoFechas(desde: string, hasta: string): string[] {
  const out: string[] = [];
  const cursor = new Date(desde + "T00:00:00");
  const fin = new Date(hasta + "T00:00:00");
  while (cursor.getTime() <= fin.getTime()) {
    out.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`,
    );
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}
