"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { COLOR_ESTADO_TRAMITE, contarPorEstado } from "@/lib/tramites";
import type { Tramite } from "@/types";

/**
 * Reparto de los trámites del proyecto por estado.
 *
 * Es una dona y no una torta maciza para poder poner el total en el centro: la pregunta
 * "¿cuántos trámites tengo?" es tan frecuente como "¿cómo están repartidos?" y así ambas
 * se responden de una mirada.
 *
 * La leyenda de la derecha NO es decorativa: lleva los mismos números en texto, que es lo
 * que leen un lector de pantalla y quien no distingue los colores. El gráfico se marca como
 * `aria-hidden` precisamente porque la leyenda ya dice todo lo que él dibuja.
 */
export function TramitesTorta({ tramites }: { tramites: Pick<Tramite, "estado">[] }) {
  const porEstado = contarPorEstado(tramites);
  const conDatos = porEstado.filter((d) => d.total > 0);
  const total = tramites.length;

  if (total === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        La torta aparece al registrar el primer trámite.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={conDatos}
              dataKey="total"
              nameKey="estado"
              innerRadius="58%"
              outerRadius="100%"
              paddingAngle={conDatos.length > 1 ? 2 : 0}
              stroke="var(--color-card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {conDatos.map((d) => (
                <Cell key={d.estado} fill={COLOR_ESTADO_TRAMITE[d.estado]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(valor, nombre) => {
                // El tipo de recharts admite `undefined`; se normaliza aquí en vez de
                // castear, que dejaría un NaN en el tooltip si algún día llega vacío.
                const n = Number(valor) || 0;
                return [`${n} de ${total} (${Math.round((n / total) * 100)}%)`, String(nombre ?? "")];
              }}
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold leading-none">{total}</span>
          <span className="text-xs text-muted-foreground">trámite{total !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <ul className="flex w-full flex-col gap-1.5">
        {conDatos.map((d) => (
          <li key={d.estado} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: COLOR_ESTADO_TRAMITE[d.estado] }}
            />
            <span className="flex-1 truncate">{d.estado}</span>
            <span className="font-semibold tabular-nums">{d.total}</span>
            <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
              {Math.round((d.total / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
