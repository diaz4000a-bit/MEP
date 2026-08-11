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
