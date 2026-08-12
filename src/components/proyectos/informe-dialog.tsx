"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TODOS = "__todos__";

function hoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function InformeDialog({ proyectoId, responsables }: { proyectoId: string; responsables: string[] }) {
  const [open, setOpen] = useState(false);
  const [fecha, setFecha] = useState(hoy());
  const [resp, setResp] = useState("");

  const generar = () => {
    const params = new URLSearchParams({ fecha });
    if (resp) params.set("resp", resp);
    window.open(`/api/informe/${proyectoId}?${params.toString()}`, "_blank");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Informe diario</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Informe de progreso diario</DialogTitle>
          <DialogDescription>
            Incluye las tareas con avance o cambio de estado en la fecha elegida, y la jornada registrada de cada
            trabajador. Se abre listo para imprimir o guardar como PDF.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inf-fecha">Fecha del informe</Label>
            <Input id="inf-fecha" type="date" value={fecha} max={hoy()} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inf-resp">Trabajador</Label>
            <Select
              value={resp || TODOS}
              items={{ [TODOS]: "Todos los trabajadores", ...Object.fromEntries(responsables.map((r) => [r, r])) }}
              onValueChange={(v) => setResp(!v || v === TODOS ? "" : v)}
            >
              <SelectTrigger id="inf-resp" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos los trabajadores</SelectItem>
                {responsables.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={generar}>Generar PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
