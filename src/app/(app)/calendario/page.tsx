import Link from "next/link";
import { CalendarioVista } from "@/components/calendario/calendario-vista";
import { exigirUsuario } from "@/lib/auth/sesion";
import { construirEventos, esFecha, esVista, type VistaCalendario } from "@/lib/calendario";
import { leerProyectos, leerTareas } from "@/lib/datos";
import { fechaBogota } from "@/lib/tiempo";

const VISTA_POR_DEFECTO: VistaCalendario = "mes";

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string; fecha?: string; proyecto?: string }>;
}) {
  await exigirUsuario();
  const params = await searchParams;

  // `leerProyectos`/`leerTareas` están memoizadas por request y el layout de (app) ya pidió
  // los proyectos, así que el calendario no añade un escaneo extra de esa colección. Se
  // traen TODOS los eventos de una vez: navegar entre meses o cambiar de vista es puro cliente.
  const [proyectos, tareas] = await Promise.all([leerProyectos(), leerTareas()]);
  const eventos = construirEventos(proyectos, tareas);

  // La querystring llega sin control desde el enlace que sea: cualquier valor raro cae al
  // valor por defecto en vez de dejar que la rejilla se construya con una fecha inválida.
  const vistaParam = params.vista ?? "";
  const fechaParam = params.fecha ?? "";
  const vista = esVista(vistaParam) ? vistaParam : VISTA_POR_DEFECTO;
  const hoy = fechaBogota();
  const fecha = esFecha(fechaParam) ? fechaParam : hoy;
  const proyectoInicial = proyectos.some((p) => p.id === params.proyecto) ? (params.proyecto ?? "") : "";

  const opciones = [...proyectos]
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .map((p) => ({ id: p.id, nombre: p.nombre }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium">Calendario</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Entregas de proyecto, inicios y fechas límite de tareas. Pulsa un día para verlo en detalle.
        </p>
      </div>

      {eventos.length === 0 ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">
          <p className="text-sm text-muted-foreground">
            Ningún proyecto ni tarea tiene fechas cargadas todavía.{" "}
            <Link href="/proyectos" className="text-primary hover:underline">
              Añade la fecha de entrega en el proyecto
            </Link>{" "}
            y aparecerá aquí.
          </p>
        </div>
      ) : (
        <CalendarioVista
          eventos={eventos}
          proyectos={opciones}
          hoy={hoy}
          vistaInicial={vista}
          fechaInicial={fecha}
          proyectoInicial={proyectoInicial}
        />
      )}
    </div>
  );
}
