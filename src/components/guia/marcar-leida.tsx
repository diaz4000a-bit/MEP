"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { marcarLeccionLeida } from "@/app/(app)/guia/actions";
import { Button } from "@/components/ui/button";

export function MarcarLeida({ leccionId, leidaInicial }: { leccionId: string; leidaInicial: boolean }) {
  const [leida, setLeida] = useState(leidaInicial);
  const [pending, startTransition] = useTransition();

  const alternar = () => {
    const nuevoValor = !leida;
    setLeida(nuevoValor);
    startTransition(async () => {
      try {
        await marcarLeccionLeida(leccionId, nuevoValor);
      } catch {
        setLeida(!nuevoValor);
        toast.error("No se pudo guardar el progreso de lectura.");
      }
    });
  };

  return (
    <Button variant={leida ? "secondary" : "outline"} size="sm" onClick={alternar} disabled={pending}>
      {leida ? "✓ Leída" : "Marcar como leída"}
    </Button>
  );
}
