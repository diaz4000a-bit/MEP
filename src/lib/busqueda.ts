import "server-only";
import { GUIA_MODULOS } from "@/content/guia";
import { leerProyectos, leerTareas } from "@/lib/datos";
import type { EstadoTarea, Tarea } from "@/types";

export interface ItemBusqueda {
  tipo: "Proyectos" | "Zonas" | "Tareas" | "Guía";
  id: string;
  label: string;
  sub?: string;
  estado?: EstadoTarea;
  href: string;
  /** Texto plano contra el que se filtra (nombre + contexto), no lo que se muestra. */
  key: string;
}

/** Índice plano de todo lo navegable: proyectos, zonas, tareas y lecciones de la guía. */
export async function construirIndiceBusqueda(): Promise<ItemBusqueda[]> {
  const [proyectos, tareas] = await Promise.all([leerProyectos(), leerTareas()]);

  const proyectosPorId = new Map(proyectos.map((p) => [p.id, p]));
  // Un solo agrupado por proyecto en vez de recorrer `tareas` entera dentro del
  // bucle de proyectos: era O(P x T) y con 20 proyectos x 2000 tareas daba 40.000
  // iteraciones por render del layout, o sea en cada carga de página.
  const tareasPorProyecto = new Map<string, Tarea[]>();
  for (const t of tareas) {
    const lista = tareasPorProyecto.get(t.proyectoId);
    if (lista) lista.push(t);
    else tareasPorProyecto.set(t.proyectoId, [t]);
  }

  const items: ItemBusqueda[] = [];

  for (const p of proyectos) {
    items.push({
      tipo: "Proyectos",
      id: p.id,
      label: p.nombre,
      sub: p.cliente || undefined,
      href: `/proyectos/${p.id}`,
      key: `${p.nombre} ${p.cliente ?? ""}`,
    });

    const zonas = new Set(p.zonas ?? []);
    for (const t of tareasPorProyecto.get(p.id) ?? []) {
      if (t.zona) zonas.add(t.zona);
    }
    for (const z of zonas) {
      items.push({
        tipo: "Zonas",
        id: `${p.id}__${z}`,
        label: z,
        sub: p.nombre,
        href: `/proyectos/${p.id}/zona/${encodeURIComponent(z)}`,
        key: `${z} ${p.nombre}`,
      });
    }
  }

  for (const t of tareas) {
    const proyecto = proyectosPorId.get(t.proyectoId);
    items.push({
      tipo: "Tareas",
      id: t.id,
      label: t.nombre,
      sub: [proyecto?.nombre, t.responsable].filter(Boolean).join(" · "),
      estado: t.estado,
      href: `/proyectos/${t.proyectoId}/tarea/${t.id}`,
      key: `${t.nombre} ${t.responsable} ${t.zona ?? ""} ${proyecto?.nombre ?? ""}`,
    });
  }

  for (const m of GUIA_MODULOS) {
    for (const l of m.lecciones) {
      items.push({
        tipo: "Guía",
        id: l.id,
        label: l.titulo,
        sub: m.nombre,
        href: `/guia/${m.id}/${l.id}`,
        key: `${l.titulo} ${m.nombre}`,
      });
    }
  }

  return items;
}
