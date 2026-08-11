"use client";

import { Button } from "@/components/ui/button";
import { formatearDuracion, formatearHora } from "@/lib/jornadas";
import type { Jornada } from "@/types";

function csvEscape(valor: string): string {
  if (/[",\n]/.test(valor)) return `"${valor.replace(/"/g, '""')}"`;
  return valor;
}

export function ExportarCsvBoton({ jornadas }: { jornadas: Jornada[] }) {
  const exportar = () => {
    const encabezados = ["Fecha", "Usuario", "Proyecto", "Tarea", "Entrada", "Salida", "Duración", "Estado", "Notas"];
    const filas = jornadas.map((j) => [
      j.fecha,
      j.usuarioNombre,
      j.proyectoNombre,
      j.tareaNombre ?? "",
      formatearHora(j.entrada),
      j.salida ? formatearHora(j.salida) : "",
      j.duracionMin != null ? formatearDuracion(j.duracionMin) : "",
      j.estado,
      j.notas,
    ]);
    const csv = [encabezados, ...filas].map((fila) => fila.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jornadas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={exportar} disabled={jornadas.length === 0}>
      Exportar CSV
    </Button>
  );
}
