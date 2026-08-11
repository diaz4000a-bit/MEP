"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { crearProyecto, crearProyectoDesdeplantilla } from "@/app/(app)/proyectos/actions";

const HOY = new Date().toISOString().slice(0, 10);

export function NuevoProyectoDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [modo, setModo] = useState<"vacio" | "plantilla">("plantilla");
  const [pending, startTransition] = useTransition();
  const [nombre, setNombre] = useState("");
  const [cliente, setCliente] = useState("");
  const [fechaInicio, setFechaInicio] = useState(HOY);
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [software, setSoftware] = useState("Revit");

  const crear = () => {
    if (!nombre.trim()) {
      toast.error("El nombre del proyecto es obligatorio.");
      return;
    }
    const datos = { nombre: nombre.trim(), cliente: cliente.trim(), fechaInicio, fechaEntrega, software };
    startTransition(async () => {
      try {
        const { id } =
          modo === "plantilla" ? await crearProyectoDesdeplantilla(datos) : await crearProyecto(datos);
        setOpen(false);
        router.push(`/proyectos/${id}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo crear el proyecto.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Nuevo proyecto</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo proyecto</DialogTitle>
          <DialogDescription>Crea un proyecto en blanco o desde la plantilla base.</DialogDescription>
        </DialogHeader>

        <Tabs value={modo} onValueChange={(v) => setModo(v as typeof modo)}>
          <TabsList>
            <TabsTrigger value="plantilla">Desde plantilla (78 tareas)</TabsTrigger>
            <TabsTrigger value="vacio">En blanco</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-nombre">Nombre *</Label>
            <Input id="p-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-cliente">Cliente</Label>
            <Input id="p-cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-inicio">Fecha de inicio</Label>
              <Input id="p-inicio" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-entrega">Fecha de entrega</Label>
              <Input id="p-entrega" type="date" value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-software">Software</Label>
            <Input id="p-software" value={software} onChange={(e) => setSoftware(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={crear} disabled={pending}>
            {pending ? "Creando…" : "Crear proyecto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
