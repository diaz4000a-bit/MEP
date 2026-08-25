/**
 * Destinatarios del informe por WhatsApp. Lógica pura: sin red, sin credenciales y sin
 * atarse a una pasarela concreta.
 *
 * Los números se guardan en configuración (`INFORME_WHATSAPP_DESTINOS`) y no en código
 * porque cambiar a quién le llega el informe es una decisión de operación —un ingeniero
 * entra al proyecto, otro sale— y no debería exigir un despliegue.
 */

/** Colombia. Un número de 10 dígitos sin prefijo se asume nacional. */
const INDICATIVO_POR_DEFECTO = "57";

/**
 * Destinatarios de fábrica: los dos números con los que se pidió la función.
 *
 * Están en código y no solo en `.env` para que el botón aparezca funcionando desde el primer
 * arranque, sin depender de que alguien copie una variable. `INFORME_WHATSAPP_DESTINOS` los
 * reemplaza por completo cuando está definida, que es lo que permite cambiar de destinatario
 * sin desplegar.
 */
export const DESTINOS_POR_DEFECTO = "+57 320 4537010, +57 310 8043958";

/**
 * Tope de destinatarios por envío. No lo impone ninguna pasarela: es un freno a que una
 * coma de más en la variable de entorno convierta el informe diario en una campaña de SMS
 * facturada por mensaje.
 */
export const MAX_DESTINOS = 10;

/**
 * Lleva un número a E.164 (`+573204537010`), el formato que exigen los enlaces wa.me y
 * cualquier pasarela de WhatsApp.
 * Devuelve `null` si no puede: nunca adivina un indicativo internacional.
 */
export function normalizarNumeroWhatsApp(entrada: string): string | null {
  const bruto = String(entrada ?? "").trim();
  if (!bruto) return null;

  const internacional = bruto.startsWith("+") || bruto.startsWith("00");
  const digitos = bruto.replace(/\D/g, "").replace(/^00/, "");
  if (!digitos) return null;

  // Ya trae indicativo: se respeta tal cual. Un "+1..." es un número de EE.UU. y asumir
  // Colombia por estar en un proyecto colombiano mandaría el informe a un desconocido.
  if (internacional || digitos.startsWith(INDICATIVO_POR_DEFECTO)) {
    return digitos.length >= 8 && digitos.length <= 15 ? `+${digitos}` : null;
  }

  // Nacional sin indicativo: móviles y fijos colombianos son de 10 dígitos desde 2022.
  if (digitos.length === 10) return `+${INDICATIVO_POR_DEFECTO}${digitos}`;

  return null;
}

export interface DestinosWhatsApp {
  /** Números en E.164, sin repetidos, en el orden en que se configuraron. */
  validos: string[];
  /** Entradas que no se pudieron interpretar. Se reportan, no se descartan en silencio. */
  invalidos: string[];
}

/**
 * Interpreta la variable `INFORME_WHATSAPP_DESTINOS`. Acepta comas, punto y coma o saltos
 * de línea como separador, porque los tres aparecen al pegar una lista desde un correo.
 */
export function leerDestinos(configuracion: string | undefined): DestinosWhatsApp {
  const partes = String(configuracion?.trim() || DESTINOS_POR_DEFECTO)
    .split(/[,;\n]/)
    .map((p) => p.trim())
    .filter(Boolean);

  const validos: string[] = [];
  const invalidos: string[] = [];

  for (const parte of partes) {
    const numero = normalizarNumeroWhatsApp(parte);
    if (!numero) {
      invalidos.push(parte);
      continue;
    }
    if (!validos.includes(numero)) validos.push(numero);
  }

  return { validos: validos.slice(0, MAX_DESTINOS), invalidos };
}

/**
 * Enlace de "clic para chatear" de WhatsApp con el mensaje ya redactado.
 *
 * Es la vía sin API: no hay cuenta de negocio, ni plantilla que aprobar, ni pasarela que se
 * caiga. A cambio el envío lo confirma la persona, que es también la razón por la que este
 * enlace tiene que salir de un `<a href>` real y no de un `window.open()` tras un `await`:
 * el navegador bloquea como pop-up toda ventana que no nazca directamente del clic.
 */
export function enlaceWhatsApp(numero: string, texto: string): string {
  const e164 = normalizarNumeroWhatsApp(numero);
  if (!e164) return "";
  // wa.me quiere el número sin "+" ni separadores.
  return `https://wa.me/${e164.slice(1)}?text=${encodeURIComponent(texto)}`;
}

/** "+573204537010" → "320 4537010". Para rotular el botón como se lee un número aquí. */
export function formatearNumeroLegible(e164: string): string {
  const digitos = e164.replace(/\D/g, "");
  if (digitos.startsWith(INDICATIVO_POR_DEFECTO) && digitos.length === 12) {
    const nacional = digitos.slice(2);
    return `${nacional.slice(0, 3)} ${nacional.slice(3)}`;
  }
  return e164;
}
