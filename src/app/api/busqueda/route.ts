import { exigirUsuario } from "@/lib/auth/sesion";
import { construirIndiceBusqueda } from "@/lib/busqueda";

/**
 * Índice de la paleta de búsqueda, bajo demanda.
 *
 * Antes lo construía el layout de `(app)`, así que CADA página renderizada leía la
 * colección `proyectos` entera y el collection group `tareas` entero, y además serializaba
 * el índice completo en el payload RSC aunque el usuario no llegara a abrir la paleta.
 * Con 20 proyectos y 2.000 tareas eso son ~2.020 lecturas facturadas y cientos de KB
 * extra por navegación. Aquí el coste se paga solo cuando alguien busca de verdad.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  // Mismo control de sesión que las páginas: el índice expone nombres de proyectos,
  // zonas, tareas y responsables, y no debe servirse sin sesión.
  await exigirUsuario();

  const items = await construirIndiceBusqueda();
  return Response.json(items, {
    // Privado y de vida corta: es contenido por usuario que cambia con cada edición de
    // tarea, pero abrir la paleta varias veces seguidas no debe recalcularlo cada vez.
    headers: { "cache-control": "private, max-age=30" },
  });
}
