import { ProyectosList } from "@/components/proyectos/proyectos-list";
import { puede } from "@/lib/auth/roles";
import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import type { Proyecto } from "@/types";

export default async function ProyectosPage() {
  // La comprobación va aquí y no solo en el layout: con Partial Rendering el layout
  // no se vuelve a renderizar al navegar, así que no protege este segmento.
  const usuario = await exigirUsuario();
  const snap = await adminDb.collection("proyectos").orderBy("actualizado", "desc").get();
  const proyectos = snap.docs.map((d) => d.data() as Proyecto);

  return (
    <ProyectosList
      proyectosIniciales={proyectos}
      puedeCrear={puede(usuario.rol, "crearProyecto")}
    />
  );
}
