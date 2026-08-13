import { AppShell } from "@/components/layout/app-shell";
import { exigirUsuario } from "@/lib/auth/sesion";
import { construirIndiceBusqueda } from "@/lib/busqueda";
import { leerProyectos } from "@/lib/datos";

const PROYECTOS_EN_SIDEBAR = 20;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();

  // `leerProyectos` está memoizada por request y `construirIndiceBusqueda` la usa por
  // dentro: antes esto eran DOS consultas a `proyectos` en el mismo Promise.all (una
  // acotada a 20 para el sidebar y otra completa para el índice). Ahora es una sola,
  // y el top-20 del sidebar se deriva en memoria.
  const [todos, indiceBusqueda] = await Promise.all([leerProyectos(), construirIndiceBusqueda()]);

  const proyectos = [...todos]
    .sort((a, b) => b.actualizado - a.actualizado)
    .slice(0, PROYECTOS_EN_SIDEBAR)
    .map((p) => ({ id: p.id, nombre: p.nombre, avanceTotal: p.avanceTotal ?? 0 }));

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
