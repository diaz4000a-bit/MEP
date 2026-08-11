import { AppShell } from "@/components/layout/app-shell";
import { exigirUsuario } from "@/lib/auth/sesion";
import { construirIndiceBusqueda } from "@/lib/busqueda";
import { adminDb } from "@/lib/firebase/admin";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();

  const [snap, indiceBusqueda] = await Promise.all([
    adminDb.collection("proyectos").orderBy("actualizado", "desc").limit(20).get(),
    construirIndiceBusqueda(),
  ]);
  const proyectos = snap.docs.map((doc) => ({
    id: doc.id,
    nombre: doc.data().nombre as string,
    avanceTotal: (doc.data().avanceTotal as number) ?? 0,
  }));

  return (
    <AppShell
      usuario={{ uid: usuario.uid, nombre: usuario.nombre, rol: usuario.rol }}
      proyectos={proyectos}
      indiceBusqueda={indiceBusqueda}
    >
      {children}
    </AppShell>
  );
}
