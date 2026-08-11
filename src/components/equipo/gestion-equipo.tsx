"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { agregarResponsable, quitarResponsable } from "@/app/(app)/equipo/actions";
import { iniciales } from "@/lib/equipo";
import { icono } from "@/lib/icons";

const IconUserPlus = icono("ti-user-plus");
const IconTrash = icono("ti-trash");

export function GestionEquipo({ membersLegacy }: { membersLegacy: string[] }) {
  const [pending, startTransition] = useTransition();
  const [nuevoNombre, setNuevoNombre] = useState("");

  const agregar = () => {
    const nombre = nuevoNombre.trim();
    if (!nombre) return;
    startTransition(async () => {
      try {
        await agregarResponsable(nombre);
        setNuevoNombre("");
        toast.success("Responsable agregado.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "No se pudo agregar el responsable.");
      }
    });
  };

  const quitar = (nombre: string) => {
    if (!confirm(`¿Quitar a "${nombre}" del equipo?`)) return;
    startTransition(async () => {
      try {
        await quitarResponsable(nombre);
        toast.success("Responsable eliminado.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "No se pudo quitar el responsable.");
      }
    });
  };

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <h3 className="flex items-center gap-1.5 text-sm font-medium">Gestionar equipo</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Los responsables registrados aquí aparecen como sugerencia al asignar tareas.
      </p>

      {membersLegacy.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Sin responsables registrados.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-1.5">
          {membersLegacy.map((nombre) => (
            <div key={nombre} className="flex items-center gap-2.5 rounded-lg px-1 py-1">
              <Avatar size="sm">
                <AvatarFallback>{iniciales(nombre)}</AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm font-medium">{nombre}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-estado-bloqueada"
                title="Quitar"
                disabled={pending}
                onClick={() => quitar(nombre)}
              >
                <IconTrash size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Input
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          placeholder="Nombre del nuevo responsable"
          className="max-w-xs"
          disabled={pending}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
        />
        <Button size="sm" disabled={pending} onClick={agregar}>
          <IconUserPlus size={16} /> Agregar
        </Button>
      </div>
    </div>
  );
}
