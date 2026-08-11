import Link from "next/link";
import { GUIA_MODULOS, LECCIONES } from "@/content/guia";
import { exigirUsuario } from "@/lib/auth/sesion";
import { icono } from "@/lib/icons";

export default async function GuiaPage() {
  const usuario = await exigirUsuario();
  const leidas = new Set(usuario.guiaLeidas ?? []);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium">Guía de aprendizaje</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {GUIA_MODULOS.length} módulos, {LECCIONES.size} lecciones. Fundamentos de modelado MEP eléctrico en Revit,
          aplicados a las tareas reales del catálogo.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {GUIA_MODULOS.map((m) => {
          const Icon = icono(m.icon);
          const total = m.lecciones.length;
          const leidasModulo = m.lecciones.filter((l) => leidas.has(l.id)).length;
          const pct = total > 0 ? Math.round((leidasModulo / total) * 100) : 0;

          return (
            <div key={m.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-medium">{m.nombre}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {m.nivel} · {total} lecciones
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold">
                  {leidasModulo}/{total}
                </span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">{m.descripcion}</p>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
              </div>

              <ul className="mt-3 flex flex-col gap-1">
                {m.lecciones.map((l) => {
                  const leida = leidas.has(l.id);
                  return (
                    <li key={l.id}>
                      <Link
                        href={`/guia/${m.id}/${l.id}`}
                        className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                      >
                        <span className="flex items-center gap-2">
                          <span className={leida ? "text-estado-completada" : "text-muted-foreground"}>
                            {leida ? "✓" : "○"}
                          </span>
                          {l.titulo}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">{l.minutos} min</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
