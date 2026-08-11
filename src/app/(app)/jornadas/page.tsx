import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExportarCsvBoton } from "@/components/jornada/exportar-csv-boton";
import { JornadasFiltros } from "@/components/jornada/jornadas-filtros";
import { exigirUsuario } from "@/lib/auth/sesion";
import { puede } from "@/lib/auth/roles";
import { adminDb } from "@/lib/firebase/admin";
import { esJornadaColgada, formatearDuracion, formatearHora } from "@/lib/jornadas";
import type { Jornada, Proyecto, Usuario } from "@/types";

const ESTILO_ESTADO_JORNADA: Record<Jornada["estado"], string> = {
  abierta: "bg-primary/15 text-primary",
  cerrada: "bg-estado-completada/15 text-estado-completada",
  anulada: "bg-muted text-muted-foreground",
};

function primerDiaDelMes(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
function hoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function JornadasPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; uid?: string; proyecto?: string }>;
}) {
  const usuario = await exigirUsuario();
  const puedeVerAjenas = puede(usuario.rol, "verJornadasAjenas");
  const params = await searchParams;

  const desde = params.desde || primerDiaDelMes();
  const hasta = params.hasta || hoy();
  const uidFiltro = puedeVerAjenas ? params.uid || "" : usuario.uid;
  const proyectoFiltro = params.proyecto || "";

  const [jornadasSnap, usuariosSnap, proyectosSnap] = await Promise.all([
    adminDb.collection("jornadas").where("fecha", ">=", desde).where("fecha", "<=", hasta).orderBy("fecha", "desc").get(),
    puedeVerAjenas ? adminDb.collection("usuarios").get() : Promise.resolve(null),
    adminDb.collection("proyectos").get(),
  ]);

  let jornadas = jornadasSnap.docs.map((d) => d.data() as Jornada);
  if (uidFiltro) jornadas = jornadas.filter((j) => j.uid === uidFiltro);
  if (proyectoFiltro) jornadas = jornadas.filter((j) => j.proyectoId === proyectoFiltro);

  const usuarios = usuariosSnap
    ? usuariosSnap.docs.map((d) => d.data() as Usuario).sort((a, b) => a.nombre.localeCompare(b.nombre))
    : [];
  const proyectos = proyectosSnap.docs.map((d) => d.data() as Proyecto).sort((a, b) => a.nombre.localeCompare(b.nombre));

  const minutosValidos = (j: Jornada) => (j.estado === "cerrada" ? (j.duracionMin ?? 0) : 0);

  const totalesPorUsuario = Object.values(
    jornadas.reduce<Record<string, { nombre: string; minutos: number; sesiones: number }>>((acc, j) => {
      acc[j.uid] ??= { nombre: j.usuarioNombre, minutos: 0, sesiones: 0 };
      acc[j.uid].minutos += minutosValidos(j);
      acc[j.uid].sesiones += 1;
      return acc;
    }, {}),
  ).sort((a, b) => b.minutos - a.minutos);

  const totalesPorProyecto = Object.values(
    jornadas.reduce<Record<string, { nombre: string; minutos: number; sesiones: number }>>((acc, j) => {
      acc[j.proyectoId] ??= { nombre: j.proyectoNombre, minutos: 0, sesiones: 0 };
      acc[j.proyectoId].minutos += minutosValidos(j);
      acc[j.proyectoId].sesiones += 1;
      return acc;
    }, {}),
  ).sort((a, b) => b.minutos - a.minutos);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-medium">Jornadas</h1>
          <p className="text-sm text-muted-foreground">
            {puedeVerAjenas ? "Registro de horas del equipo." : "Tu registro de horas."}
          </p>
        </div>
        <ExportarCsvBoton jornadas={jornadas} />
      </div>

      <JornadasFiltros
        mostrarUsuario={puedeVerAjenas}
        usuarios={usuarios.map((u) => ({ value: u.uid, label: u.nombre }))}
        proyectos={proyectos.map((p) => ({ value: p.id, label: p.nombre }))}
      />

      {(totalesPorUsuario.length > 1 || totalesPorProyecto.length > 1) && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {totalesPorUsuario.length > 1 && (
            <TotalesCard titulo="Total por usuario" filas={totalesPorUsuario} />
          )}
          {totalesPorProyecto.length > 1 && (
            <TotalesCard titulo="Total por proyecto" filas={totalesPorProyecto} />
          )}
        </div>
      )}

      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              {puedeVerAjenas && <TableHead>Usuario</TableHead>}
              <TableHead>Proyecto</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Salida</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jornadas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={puedeVerAjenas ? 7 : 6} className="py-8 text-center text-sm text-muted-foreground">
                  No hay jornadas en este rango.
                </TableCell>
              </TableRow>
            ) : (
              jornadas.map((j) => {
                const colgada = j.estado === "abierta" && esJornadaColgada(j.entrada);
                return (
                  <TableRow key={j.id}>
                    <TableCell>{j.fecha}</TableCell>
                    {puedeVerAjenas && <TableCell>{j.usuarioNombre}</TableCell>}
                    <TableCell>{j.proyectoNombre}</TableCell>
                    <TableCell>{formatearHora(j.entrada)}</TableCell>
                    <TableCell>{j.salida ? formatearHora(j.salida) : "—"}</TableCell>
                    <TableCell>{j.duracionMin != null ? formatearDuracion(j.duracionMin) : "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={ESTILO_ESTADO_JORNADA[j.estado]}>
                        {colgada ? "sin cerrar" : j.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TotalesCard({ titulo, filas }: { titulo: string; filas: { nombre: string; minutos: number; sesiones: number }[] }) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <h3 className="text-sm font-medium">{titulo}</h3>
      <div className="mt-2 flex flex-col gap-1.5">
        {filas.map((f) => (
          <div key={f.nombre} className="flex items-center justify-between text-sm">
            <span>{f.nombre}</span>
            <span className="text-muted-foreground">
              {formatearDuracion(f.minutos)} · {f.sesiones} sesión{f.sesiones !== 1 ? "es" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
