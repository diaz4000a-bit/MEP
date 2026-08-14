import { AppShell } from "@/components/layout/app-shell";
import { exigirUsuario } from "@/lib/auth/sesion";
import { leerProyectos } from "@/lib/datos";

const PROYECTOS_EN_SIDEBAR = 20;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();

  // El índice de búsqueda ya NO se construye aquí: se pide bajo demanda a /api/busqueda
  // cuando alguien abre la paleta (ver PaletaBusqueda). Construirlo en el layout obligaba
  // a leer proyectos y tareas completos en CADA navegación, los abriera alguien o no.
  const todos = await leerProyectos();

  const proyectos = [...todos]
    .sort((a, b) => b.actualizado - a.actualizado)
    .slice(0, PROYECTOS_EN_SIDEBAR)
    .map((p) => ({ id: p.id, nombre: p.nombre, avanceTotal: p.avanceTotal ?? 0 }));

  return (
    <AppShell usuario={{ uid: usuario.uid, nombre: usuario.nombre, rol: usuario.rol }} proyectos={proyectos}>
      {children}
    </AppShell>
  );
}
