import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import type { Proyecto, Tarea } from "@/types";

function slug(nombre: string): string {
  return nombre
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñ]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirUsuario();

  const proyectoRef = adminDb.doc(`proyectos/${id}`);
  const [proyectoSnap, tareasSnap] = await Promise.all([
    proyectoRef.get(),
    proyectoRef.collection("tareas").orderBy("actualizado", "desc").get(),
  ]);

  if (!proyectoSnap.exists) {
    return new Response("Proyecto no encontrado", { status: 404 });
  }

  const proyecto = proyectoSnap.data() as Proyecto;
  const tareas = tareasSnap.docs.map((d) => d.data() as Tarea);

  // Mismo formato que la v1: el proyecto lleva `tareas[]` plana, no la subcolección real.
  const exportado = { ...proyecto, tareas };

  return new Response(JSON.stringify(exportado, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${slug(proyecto.nombre) || "proyecto"}.json"`,
    },
  });
}
