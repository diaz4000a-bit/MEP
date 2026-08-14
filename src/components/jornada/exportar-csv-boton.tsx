"use client";

import { Button } from "@/components/ui/button";
import { formatearDuracion, formatearHora } from "@/lib/jornadas";
import { fechaBogota } from "@/lib/tiempo";
import type { Jornada } from "@/types";

// Excel, LibreOffice y Sheets interpretan como fórmula toda celda que empiece por = + - @
// (y por TAB o CR, que algunas versiones recortan antes de evaluar). Un nombre de proyecto
// o una nota como `=HYPERLINK("http://…","clic")` se ejecuta al abrir el CSV, no al
// generarlo: entrecomillar no basta porque las comillas se consumen al parsear.
// Prefijar con apóstrofe fuerza a que la celda se lea como texto.
const PREFIJO_FORMULA = /^[=+\-@\t\r]/;

function csvEscape(valor: string): string {
  const seguro = PREFIJO_FORMULA.test(valor) ? `'${valor}` : valor;
  if (/[",\n\r]/.test(seguro)) return `"${seguro.replace(/"/g, '""')}"`;
  return seguro;
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
    a.download = `jornadas-${fechaBogota()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={exportar} disabled={jornadas.length === 0}>
      Exportar CSV
    </Button>
  );
}
