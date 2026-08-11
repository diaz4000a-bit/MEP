import { AppShell } from "@/components/layout/app-shell";
import { adminDb } from "@/lib/firebase/admin";
import { exigirUsuario } from "@/lib/auth/sesion";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();

  const snap = await adminDb.collection("proyectos").orderBy("actualizado", "desc").limit(20).get();
  const proyectos = snap.docs.map((doc) => ({
    id: doc.id,
    nombre: doc.data().nombre as string,
    avanceTotal: (doc.data().avanceTotal as number) ?? 0,
  }));

  return (
    <AppShell usuario={{ uid: usuario.uid, nombre: usuario.nombre, rol: usuario.rol }} proyectos={proyectos}>
      {children}
    </AppShell>
  );
}
