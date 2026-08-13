import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlantillaLista, type FilaPlantilla } from "@/components/plantilla/plantilla-lista";
import { CATALOGO_TAREAS } from "@/content/catalogo-tareas";
import { GRUPOS } from "@/content/grupos";
import { exigirRol } from "@/lib/auth/sesion";
import { aplicarOverride, diffContenidoCatalogo, tareaCatalogoDesdeOverride } from "@/lib/catalogo";
import { adminDb } from "@/lib/firebase/admin";
import type { CatalogoOverride } from "@/types";

export default async function PlantillaPage() {
  await exigirRol("admin");

  const snap = await adminDb.collection("catalogoOverrides").get();
  const overrides = new Map(snap.docs.map((d) => [d.id, d.data() as CatalogoOverride]));

  const filasFabrica: FilaPlantilla[] = CATALOGO_TAREAS.map((base) => {
    const o = overrides.get(base.plantillaId);
    const tarea = aplicarOverride(base, o);
    const editada = o ? Object.keys(diffContenidoCatalogo(tarea, base).cambios).length > 0 : false;
    return { tarea, oculto: o?.oculto ?? false, esNuevo: false, editada };
  });

  const filasNuevas: FilaPlantilla[] = [...overrides.values()]
    .filter((o) => o.esNuevo)
    .map((o) => ({ tarea: tareaCatalogoDesdeOverride(o), oculto: o.oculto, esNuevo: true, editada: false }));

  const filas = [...filasFabrica, ...filasNuevas];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium">Plantilla base</h1>
          <p className="text-sm text-muted-foreground">
            Edita el catálogo de tareas que se usa al crear un proyecto nuevo desde plantilla.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/plantilla/nueva" />}>
          + Nueva tarea
        </Button>
      </div>
      <PlantillaLista filas={filas} grupos={GRUPOS} />
    </div>
  );
}
