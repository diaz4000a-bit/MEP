"use client";

import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/firebase/client";
import type { Proyecto } from "@/types";
import { ImportarJsonBoton } from "./importar-json-boton";
import { NuevoProyectoDialog } from "./nuevo-proyecto-dialog";
import { ProyectoCard } from "./proyecto-card";

export function ProyectosList({
  proyectosIniciales,
  puedeCrear,
}: {
  proyectosIniciales: Proyecto[];
  puedeCrear: boolean;
}) {
  const [proyectos, setProyectos] = useState(proyectosIniciales);

  useEffect(() => {
    const q = query(collection(db, "proyectos"), orderBy("actualizado", "desc"));
    return onSnapshot(
      q,
      (snap) => setProyectos(snap.docs.map((d) => d.data() as Proyecto)),
      () => toast.error("Se perdió la sincronización en tiempo real con Firestore."),
    );
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-medium">Proyectos</h1>
        {puedeCrear && (
          <div className="flex gap-2">
            <ImportarJsonBoton />
            <NuevoProyectoDialog />
          </div>
        )}
      </div>

      {proyectos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Todavía no hay proyectos. Crea el primero desde la plantilla base.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {proyectos.map((p) => (
            <ProyectoCard key={p.id} proyecto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
