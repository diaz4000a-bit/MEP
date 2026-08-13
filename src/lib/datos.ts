import "server-only";
import { cache } from "react";
import { adminDb } from "@/lib/firebase/admin";
import type { Proyecto, Tarea } from "@/types";

/**
 * Lecturas compartidas de las dos colecciones grandes, memoizadas por request con
 * `cache()` de React — mismo patrón y misma razón que `catalogo-vigente.ts`.
 *
 * El layout de (app) construye el índice de búsqueda y, en el MISMO request, las
 * pages de /dashboard y /equipo volvían a pedir estas dos colecciones por su cuenta:
 * una sola carga escaneaba la colección de tareas entera dos veces. Pasando a estos
 * lectores, se escanea una sola vez por request.
 *
 * `cache()` NO comparte nada entre requests ni entre usuarios: el resultado se
 * descarta al terminar el request. No introduce datos obsoletos ni fuga de sesión.
 */
export const leerProyectos = cache(async (): Promise<Proyecto[]> => {
  const snap = await adminDb.collection("proyectos").get();
  return snap.docs.map((d) => d.data() as Proyecto);
});

export const leerTareas = cache(async (): Promise<Tarea[]> => {
  const snap = await adminDb.collectionGroup("tareas").get();
  return snap.docs.map((d) => d.data() as Tarea);
});
