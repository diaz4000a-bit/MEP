"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fechaHoraLegible } from "@/lib/tareas";
import type { Tarea } from "@/types";

// Reconstruye el avance promedio del proyecto en cada instante registrado en el
// historial de sus tareas — igual al buildTimelineChart de la v1, sin Chart.js.
function construirSerie(tareas: Tarea[]) {
  const marcas = [...new Set(tareas.flatMap((t) => (t.historial ?? []).map((h) => h.f)))].sort((a, b) => a - b);
  if (marcas.length === 0) return [];
  marcas.push(Date.now());

  const valorEn = (t: Tarea, ts: number) => {
    const hist = t.historial ?? [];
    if (!hist.length) return Number(t.porcentaje) || 0;
    const previas = hist.filter((h) => h.f <= ts);
    return previas.length ? previas[previas.length - 1].p : hist[0].p;
  };

  return marcas.map((ts) => ({
    ts,
    etiqueta: fechaHoraLegible(ts),
    avance: Math.round(tareas.reduce((s, t) => s + valorEn(t, ts), 0) / tareas.length),
  }));
}

export function ProyectoTimeline({ tareas }: { tareas: Tarea[] }) {
  const datos = construirSerie(tareas);
  if (datos.length === 0) return null;

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <h3 className="text-sm font-medium">Timeline del proceso</h3>
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datos} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="avanceGradiente" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={40} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
            <Tooltip
              formatter={(value) => [`${value}% de avance`, ""]}
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="avance"
              stroke="var(--color-primary)"
              fill="url(#avanceGradiente)"
              strokeWidth={2}
              dot={{ r: 2.5, fill: "var(--color-primary)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
