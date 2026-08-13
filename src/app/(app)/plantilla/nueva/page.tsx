import { PlantillaForm } from "@/components/plantilla/plantilla-form";
import { CATEGORIAS } from "@/content/categorias";
import { GRUPOS } from "@/content/grupos";
import { exigirRol } from "@/lib/auth/sesion";
import type { TareaCatalogo } from "@/types";

const TAREA_VACIA: TareaCatalogo = {
  plantillaId: "",
  nombreOriginal: "",
  nombre: "",
  grupo: GRUPOS[0].id,
  subgrupo: GRUPOS[0].subgrupos[0],
  categoria: CATEGORIAS[0],
  disciplina: "Eléctrica",
  dificultad: 1,
  horasEstimadas: 4,
  prioridad: "Media",
  dependeDe: [],
  guiaIds: [],
  descripcion: "",
  objetivo: "",
  requisitos: [],
  procedimiento: [],
  resultadoEsperado: "",
  criteriosVerificacion: [],
  notasIngenieria: [],
  tipsRevit: [],
};

export default async function NuevaTareaPlantillaPage() {
  await exigirRol("admin");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium">Nueva tarea de plantilla</h1>
        <p className="text-sm text-muted-foreground">
          Se agrega a la plantilla base y aparecerá en los próximos proyectos creados desde plantilla.
        </p>
      </div>
      <PlantillaForm
        modo="crear"
        plantillaIdInicial=""
        tareaInicial={TAREA_VACIA}
        camposConOverride={[]}
        esNuevo={true}
      />
    </div>
  );
}
