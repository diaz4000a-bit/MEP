import { notFound } from "next/navigation";
import { PlantillaForm } from "@/components/plantilla/plantilla-form";
import { CATALOGO_TAREAS_MAP } from "@/content/catalogo-tareas";
import { exigirRol } from "@/lib/auth/sesion";
import { CAMPOS_CONTENIDO_CATALOGO, aplicarOverride, tareaCatalogoDesdeOverride } from "@/lib/catalogo";
import { adminDb } from "@/lib/firebase/admin";
import type { CatalogoOverride } from "@/types";

export default async function EditarPlantillaPage({
  params,
}: {
  params: Promise<{ plantillaId: string }>;
}) {
  await exigirRol("admin");
  const { plantillaId } = await params;

  const snap = await adminDb.doc(`catalogoOverrides/${plantillaId}`).get();
  const override = snap.exists ? (snap.data() as CatalogoOverride) : undefined;
  const base = CATALOGO_TAREAS_MAP.get(plantillaId);

  if (!base && !override) notFound();

  const tarea = base ? aplicarOverride(base, override) : tareaCatalogoDesdeOverride(override!);
  const esNuevo = !base;
  const camposConOverride = override
    ? CAMPOS_CONTENIDO_CATALOGO.filter((c) => override[c] !== undefined)
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium">{tarea.nombre}</h1>
        <p className="text-sm text-muted-foreground">
          {esNuevo ? "Tarea creada por el admin, fuera de la plantilla original." : `Plantilla de fábrica ${plantillaId}.`}
        </p>
      </div>
      <PlantillaForm
        key={`${plantillaId}-${override?.actualizado ?? 0}`}
        modo="editar"
        plantillaIdInicial={plantillaId}
        tareaInicial={tarea}
        camposConOverride={camposConOverride}
        esNuevo={esNuevo}
      />
    </div>
  );
}
