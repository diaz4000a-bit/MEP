import { IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Seccion, SeccionLista } from "@/components/contenido/seccion-card";
import { MarcarLeida } from "@/components/guia/marcar-leida";
import { GUIA_MODULOS, LECCIONES } from "@/content/guia";
import { exigirUsuario } from "@/lib/auth/sesion";
import { catalogoVigente } from "@/lib/catalogo-vigente";

const TODAS_LECCIONES = GUIA_MODULOS.flatMap((m) => m.lecciones.map((l) => ({ ...l, moduloId: m.id })));

export function generateStaticParams() {
  return GUIA_MODULOS.flatMap((m) => m.lecciones.map((l) => ({ modulo: m.id, leccion: l.id })));
}

export default async function LeccionPage({
  params,
}: {
  params: Promise<{ modulo: string; leccion: string }>;
}) {
  const { modulo, leccion: leccionId } = await params;
  const usuario = await exigirUsuario();

  const mod = GUIA_MODULOS.find((m) => m.id === modulo);
  const leccion = LECCIONES.get(leccionId);
  if (!mod || !leccion || !mod.lecciones.some((l) => l.id === leccionId)) notFound();

  const leida = (usuario.guiaLeidas ?? []).includes(leccion.id);
  const { lista: catalogo } = await catalogoVigente();
  const tareasRelacionadas = catalogo.filter((t) => t.guiaIds.includes(leccion.id));

  const idx = TODAS_LECCIONES.findIndex((l) => l.id === leccion.id);
  const anterior = idx > 0 ? TODAS_LECCIONES[idx - 1] : null;
  const siguiente = idx < TODAS_LECCIONES.length - 1 ? TODAS_LECCIONES[idx + 1] : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/guia" className="hover:text-foreground">
          Guía de aprendizaje
        </Link>
        <IconChevronRight size={14} />
        <span className="text-foreground">{mod.nombre}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div>
          <p className="text-xs text-muted-foreground">
            {mod.nombre} · {leccion.minutos} min
          </p>
          <h1 className="text-lg font-medium">{leccion.titulo}</h1>
        </div>
        <MarcarLeida leccionId={leccion.id} leidaInicial={leida} />
      </div>

      <Seccion titulo="Qué es">{leccion.queEs}</Seccion>
      <Seccion titulo="Para qué sirve">{leccion.paraQueSirve}</Seccion>
      <Seccion titulo="Cuándo usarlo">{leccion.cuandoUsarlo}</Seccion>
      <SeccionLista titulo="Procedimiento" items={leccion.procedimiento} numerada />
      <SeccionLista titulo="Errores frecuentes" items={leccion.erroresFrecuentes} />
      <SeccionLista titulo="Buenas prácticas" items={leccion.buenasPracticas} />
      <Seccion titulo="Ejemplo aplicado">{leccion.ejemploAplicado}</Seccion>

      {tareasRelacionadas.length > 0 && (
        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <h3 className="text-sm font-medium">Tareas del catálogo que usan esto</h3>
          <ul className="mt-2 flex flex-col gap-1.5 text-sm">
            {tareasRelacionadas.map((t) => (
              <li key={t.plantillaId} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{t.nombre}</span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{t.plantillaId}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-sm">
        {anterior ? (
          <Link href={`/guia/${anterior.moduloId}/${anterior.id}`} className="text-primary hover:underline">
            ← {anterior.titulo}
          </Link>
        ) : (
          <span />
        )}
        {siguiente ? (
          <Link href={`/guia/${siguiente.moduloId}/${siguiente.id}`} className="text-primary hover:underline">
            {siguiente.titulo} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
