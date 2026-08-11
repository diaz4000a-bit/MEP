import { ProyectosList } from "@/components/proyectos/proyectos-list";
import { adminDb } from "@/lib/firebase/admin";
import type { Proyecto } from "@/types";

export default async function ProyectosPage() {
  const snap = await adminDb.collection("proyectos").orderBy("actualizado", "desc").get();
  const proyectos = snap.docs.map((d) => d.data() as Proyecto);

  return <ProyectosList proyectosIniciales={proyectos} />;
}
