"use server";

import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { CATALOGO_TAREAS_MAP } from "@/content/catalogo-tareas";
import { CATEGORIAS } from "@/content/categorias";
import { GRUPOS } from "@/content/grupos";
import { LECCIONES } from "@/content/guia";
import { exigirRol } from "@/lib/auth/sesion";
import { CAMPOS_CONTENIDO_CATALOGO, diffContenidoCatalogo, type CampoContenidoCatalogo } from "@/lib/catalogo";
import { validarTareaCatalogo } from "@/lib/catalogo-validacion";
import { catalogoVigente } from "@/lib/catalogo-vigente";
import { adminDb } from "@/lib/firebase/admin";
import type { CatalogoOverride, TareaCatalogo } from "@/types";

const CONTEXTO_VALIDACION = {
  grupos: GRUPOS,
  categorias: CATEGORIAS,
  leccionesIds: new Set(LECCIONES.keys()),
};

function refOverride(plantillaId: string) {
  return adminDb.doc(`catalogoOverrides/${plantillaId}`);
}

/**
 * Crea o edita una tarea del catálogo. Si `plantillaId` es de fábrica, guarda solo el diff.
 * `opciones.crear` distingue "Nueva tarea" de "editar esta tarea": sin este chequeo, crear con
 * un plantillaId que ya existe (typo del admin) pisaría en silencio esa tarea de fábrica o esa
 * tarea custom en vez de fallar con un error.
 */
export async function guardarOverrideCatalogo(
  plantillaId: string,
  resultante: TareaCatalogo,
  opciones: { crear: boolean },
) {
  const admin = await exigirRol("admin");
  if (resultante.plantillaId !== plantillaId) throw new Error("El plantillaId no coincide.");

  const baseFabrica = CATALOGO_TAREAS_MAP.get(plantillaId);
  const overrideExistente = await refOverride(plantillaId).get();

  if (opciones.crear) {
    if (baseFabrica || overrideExistente.exists) {
      throw new Error(`Ya existe una tarea con el id "${plantillaId}".`);
    }
  } else if (!baseFabrica && !overrideExistente.exists) {
    throw new Error("Esta tarea ya no existe.");
  }

  const { mapa } = await catalogoVigente();
  const errores = validarTareaCatalogo(resultante, mapa, CONTEXTO_VALIDACION);
  if (errores.length > 0) throw new Error(errores[0]);

  const ahora = Date.now();

  if (baseFabrica) {
    const { cambios, sinCambios } = diffContenidoCatalogo(resultante, baseFabrica);
    const limpieza: Record<string, unknown> = {};
    for (const campo of sinCambios) limpieza[campo] = FieldValue.delete();
    await refOverride(plantillaId).set(
      { plantillaId, esNuevo: false, actualizado: ahora, actualizadoPor: admin.uid, ...cambios, ...limpieza },
      { merge: true },
    );
  } else {
    const contenido: Record<CampoContenidoCatalogo, unknown> = {} as Record<CampoContenidoCatalogo, unknown>;
    for (const campo of CAMPOS_CONTENIDO_CATALOGO) contenido[campo] = resultante[campo];
    await refOverride(plantillaId).set({
      plantillaId,
      oculto: false,
      esNuevo: true,
      actualizado: ahora,
      actualizadoPor: admin.uid,
      ...contenido,
    });
  }

  revalidatePath("/plantilla");
  revalidatePath(`/plantilla/${plantillaId}`);
}

/** Borra un campo editado del override: vuelve a mostrar el valor de fábrica. */
export async function restaurarCampoCatalogo(plantillaId: string, campo: CampoContenidoCatalogo) {
  await exigirRol("admin");
  if (!CAMPOS_CONTENIDO_CATALOGO.includes(campo)) throw new Error("Campo inválido.");

  const ref = refOverride(plantillaId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const override = snap.data() as CatalogoOverride;
  if (override.esNuevo) throw new Error("Esta tarea no tiene valor de fábrica al cual restaurar.");

  await ref.update({ [campo]: FieldValue.delete(), actualizado: Date.now() });
  revalidatePath("/plantilla");
  revalidatePath(`/plantilla/${plantillaId}`);
}

/** Oculta o vuelve a mostrar una tarea en /proyectos → nuevo. No borra tareas ya sembradas. */
export async function ocultarTareaCatalogo(plantillaId: string, oculto: boolean) {
  const admin = await exigirRol("admin");

  const ref = refOverride(plantillaId);
  const snap = await ref.get();
  const esNuevo = snap.exists ? Boolean((snap.data() as CatalogoOverride).esNuevo) : false;

  await ref.set(
    { plantillaId, oculto, esNuevo, actualizado: Date.now(), actualizadoPor: admin.uid },
    { merge: true },
  );
  revalidatePath("/plantilla");
}

/** Solo para tareas creadas por el admin (esNuevo): una tarea de fábrica se oculta, no se borra. */
export async function eliminarTareaCatalogoNueva(plantillaId: string) {
  await exigirRol("admin");

  const ref = refOverride(plantillaId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Esta tarea ya no existe.");
  const override = snap.data() as CatalogoOverride;
  if (!override.esNuevo) throw new Error("Una tarea de fábrica no se puede eliminar, solo ocultar.");

  await ref.delete();
  revalidatePath("/plantilla");
}
