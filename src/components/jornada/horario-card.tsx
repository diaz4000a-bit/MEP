"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { guardarHorario } from "@/app/(app)/jornadas/horario-actions";
import { DIAS_SEMANA, minutosProgramadosDia, minutosProgramadosSemana } from "@/lib/horarios";
import { formatearDuracion } from "@/lib/jornadas";
import type { DiaHorario, HorarioSemanal } from "@/types";

function BloqueInputs({
  bloque,
  onChange,
  disabled,
}: {
  bloque: { inicio: string; fin: string } | null;
  onChange: (b: { inicio: string; fin: string } | null) => void;
  disabled: boolean;
}) {
  const inicio = bloque?.inicio ?? "";
  const fin = bloque?.fin ?? "";

  const actualizar = (campo: "inicio" | "fin", valor: string) => {
    const siguiente = { inicio: campo === "inicio" ? valor : inicio, fin: campo === "fin" ? valor : fin };
    onChange(siguiente.inicio || siguiente.fin ? siguiente : null);
  };

  return (
    <div className="flex items-center gap-1">
      <Input
        type="time"
        value={inicio}
        onChange={(e) => actualizar("inicio", e.target.value)}
        disabled={disabled}
        className="h-8 w-[110px] text-xs"
      />
      <span className="text-muted-foreground">–</span>
      <Input
        type="time"
        value={fin}
        onChange={(e) => actualizar("fin", e.target.value)}
        disabled={disabled}
        className="h-8 w-[110px] text-xs"
      />
    </div>
  );
}

export function HorarioCard({
  uidObjetivo,
  nombreObjetivo,
  diasIniciales,
  puedeEditar,
}: {
  uidObjetivo: string;
  nombreObjetivo: string;
  diasIniciales: HorarioSemanal["dias"];
  puedeEditar: boolean;
}) {
  const [dias, setDias] = useState(diasIniciales);
  const [pending, startTransition] = useTransition();

  const actualizarDia = (key: keyof HorarioSemanal["dias"], parcial: Partial<DiaHorario>) => {
    setDias((d) => ({ ...d, [key]: { ...d[key], ...parcial } }));
  };

  const guardar = () => {
    startTransition(async () => {
      try {
        await guardarHorario(uidObjetivo, dias);
        toast.success("Horario guardado.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo guardar el horario.");
      }
    });
  };

  const totalSemana = minutosProgramadosSemana(dias);

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium">Horario de {nombreObjetivo}</h3>
          <p className="text-xs text-muted-foreground">
            Ventanas de mañana y tarde por día. Total programado: {formatearDuracion(totalSemana)}/semana.
          </p>
        </div>
        {puedeEditar && (
          <Button size="sm" onClick={guardar} disabled={pending}>
            Guardar horario
          </Button>
        )}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="py-1 pr-3">Día</th>
              <th className="py-1 pr-3">Mañana</th>
              <th className="py-1 pr-3">Tarde</th>
              <th className="py-1 text-right">Horas/día</th>
            </tr>
          </thead>
          <tbody>
            {DIAS_SEMANA.map(({ key, label }) => (
              <tr key={key} className="border-t border-border/60">
                <td className="py-2 pr-3 font-medium">{label}</td>
                <td className="py-2 pr-3">
                  <BloqueInputs
                    bloque={dias[key].manana}
                    onChange={(b) => actualizarDia(key, { manana: b })}
                    disabled={!puedeEditar}
                  />
                </td>
                <td className="py-2 pr-3">
                  <BloqueInputs
                    bloque={dias[key].tarde}
                    onChange={(b) => actualizarDia(key, { tarde: b })}
                    disabled={!puedeEditar}
                  />
                </td>
                <td className="py-2 text-right text-muted-foreground">
                  {formatearDuracion(minutosProgramadosDia(dias[key]))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
