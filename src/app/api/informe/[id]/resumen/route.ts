import { exigirUsuario } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import { formatearResumenWhatsApp, mereceEnvio, resumirInforme } from "@/lib/informe";
import { fechaBogota } from "@/lib/tiempo";
import { leerDestinos } from "@/lib/whatsapp";
import type { Proyecto, Tarea, Tramite } from "@/types";

/**
 * Resumen del informe diario en texto plano, listo para pegarlo en un enlace wa.me.
 *
 * Existe como endpoint —y no como prop calculada en el servidor— porque la fecha la elige el
 * usuario dentro del diálogo, así que el texto tiene que poder recalcularse sin recargar la
 * página. El cliente lo pide al abrir el diálogo y al cambiar la fecha, de modo que cuando
 * llega el clic el enlace ya está armado: un `window.open()` posterior a un `await` lo
 * bloquearía el navegador por no venir de un gesto directo.
 *
 * A diferencia del informe HTML NO incluye jornadas. La hora de entrada y salida de cada
 * trabajador es dato reservado a gestores, y un mensaje de WhatsApp se reenvía sin que la
 * app pueda comprobar quién acaba leyéndolo.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await exigirUsuario();

  const { searchParams } = new URL(request.url);
  const pedida = searchParams.get("fecha") ?? "";
  // Una fecha con otra forma no se "corrige": se ignora y se usa hoy. Interpolarla en la
  // consulta de Firestore sin validar es confiar en un parámetro de la URL.
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(pedida) ? pedida : fechaBogota();

  const proyectoRef = adminDb.doc(`proyectos/${id}`);
  const [proyectoSnap, tareasSnap, tramitesSnap] = await Promise.all([
    proyectoRef.get(),
    proyectoRef.collection("tareas").get(),
    proyectoRef.collection("tramites").get(),
  ]);

  if (!proyectoSnap.exists) {
    return Response.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  const proyecto = proyectoSnap.data() as Proyecto;
  const tareas = tareasSnap.docs.map((d) => d.data() as Tarea);
  const tramites = tramitesSnap.docs.map((d) => d.data() as Tramite);

  const resumen = resumirInforme(proyecto, tareas, tramites, fecha);
  const { validos: destinos, invalidos } = leerDestinos(process.env.INFORME_WHATSAPP_DESTINOS);

  // Un número mal escrito no puede desaparecer sin dejar rastro: así es como se pierde un
  // destinatario durante meses sin que nadie lo note.
  if (invalidos.length > 0) console.warn("[informe-resumen] destinos ignorados:", invalidos);

  return Response.json({
    fecha,
    destinos,
    texto: formatearResumenWhatsApp(resumen),
    // "No hay nada que reportar" es un desenlace correcto, no un error: el diálogo lo dice
    // y desactiva los botones en vez de dejar mandar un mensaje vacío de contenido.
    enviable: mereceEnvio(resumen),
    motivo: mereceEnvio(resumen) ? undefined : "No hubo avance ni trámites en alerta en esta fecha.",
  });
}
