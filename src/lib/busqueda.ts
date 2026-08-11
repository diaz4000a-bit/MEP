import "server-only";
import { GUIA_MODULOS } from "@/content/guia";
import { adminDb } from "@/lib/firebase/admin";
import type { EstadoTarea, Proyecto, Tarea } from "@/types";

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
  const [proyectosSnap, tareasSnap] = await Promise.all([
    adminDb.collection("proyectos").get(),
    adminDb.collectionGroup("tareas").get(),
  ]);

  const proyectos = proyectosSnap.docs.map((d) => d.data() as Proyecto);
  const tareas = tareasSnap.docs.map((d) => d.data() as Tarea);
  const proyectosPorId = new Map(proyectos.map((p) => [p.id, p]));

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
    for (const t of tareas) {
      if (t.proyectoId === p.id && t.zona) zonas.add(t.zona);
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
