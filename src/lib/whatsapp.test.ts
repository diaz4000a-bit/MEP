import { describe, expect, it } from "vitest";
import {
  DESTINOS_POR_DEFECTO,
  enlaceWhatsApp,
  formatearNumeroLegible,
  leerDestinos,
  MAX_DESTINOS,
  normalizarNumeroWhatsApp,
} from "./whatsapp";

describe("normalizarNumeroWhatsApp", () => {
  it("acepta el formato con el que se escriben los números en Colombia", () => {
    expect(normalizarNumeroWhatsApp("+57 320 4537010")).toBe("+573204537010");
    expect(normalizarNumeroWhatsApp("+57 310 8043958")).toBe("+573108043958");
  });

  it("completa el indicativo 57 cuando el número viene nacional, de 10 dígitos", () => {
    expect(normalizarNumeroWhatsApp("3204537010")).toBe("+573204537010");
    expect(normalizarNumeroWhatsApp("320 453 7010")).toBe("+573204537010");
  });

  it("reconoce el 57 ya presente sin duplicarlo", () => {
    expect(normalizarNumeroWhatsApp("573204537010")).toBe("+573204537010");
    expect(normalizarNumeroWhatsApp("00573204537010")).toBe("+573204537010");
  });

  it("respeta indicativos extranjeros en vez de asumir Colombia", () => {
    // Asumir +57 aquí mandaría el informe a un número colombiano que no es de nadie.
    expect(normalizarNumeroWhatsApp("+1 415 555 0100")).toBe("+14155550100");
  });

  it("devuelve null en vez de adivinar cuando el número no es interpretable", () => {
    expect(normalizarNumeroWhatsApp("12345")).toBeNull();
    expect(normalizarNumeroWhatsApp("")).toBeNull();
    expect(normalizarNumeroWhatsApp("no es un número")).toBeNull();
    // 9 dígitos: le falta uno para ser nacional y le sobran para ser cualquier otra cosa.
    expect(normalizarNumeroWhatsApp("320453701")).toBeNull();
  });
});

describe("leerDestinos", () => {
  it("interpreta la lista tal como está en .env.example", () => {
    const { validos, invalidos } = leerDestinos("+57 320 4537010, +57 310 8043958");
    expect(validos).toEqual(["+573204537010", "+573108043958"]);
    expect(invalidos).toEqual([]);
  });

  it("admite punto y coma o saltos de línea como separador", () => {
    expect(leerDestinos("3204537010;3108043958").validos).toHaveLength(2);
    expect(leerDestinos("3204537010\n3108043958").validos).toHaveLength(2);
  });

  it("no repite un número escrito dos veces en formatos distintos", () => {
    // Duplicarlo costaría dos mensajes facturados y llegaría dos veces al mismo teléfono.
    expect(leerDestinos("+57 320 4537010, 3204537010").validos).toEqual(["+573204537010"]);
  });

  it("reporta los inválidos en vez de descartarlos en silencio", () => {
    const { validos, invalidos } = leerDestinos("3204537010, ext-402");
    expect(validos).toEqual(["+573204537010"]);
    expect(invalidos).toEqual(["ext-402"]);
  });

  it("aplica el tope de destinatarios aunque la configuración traiga más", () => {
    const muchos = Array.from({ length: MAX_DESTINOS + 5 }, (_, i) => `32045370${String(i).padStart(2, "0")}`).join(",");
    expect(leerDestinos(muchos).validos).toHaveLength(MAX_DESTINOS);
  });

  it("cae a los destinatarios de fábrica cuando la variable no está definida", () => {
    // Es lo que hace que el botón funcione recién clonado el repo, sin copiar ningún .env.
    expect(leerDestinos(undefined).validos).toEqual(["+573204537010", "+573108043958"]);
    expect(leerDestinos("   ").validos).toEqual(leerDestinos(DESTINOS_POR_DEFECTO).validos);
  });
});

describe("enlaceWhatsApp", () => {
  it("arma el enlace wa.me con el número sin '+' y el texto codificado", () => {
    const url = enlaceWhatsApp("+57 320 4537010", "Informe diario: +40 pts");
    expect(url.startsWith("https://wa.me/573204537010?text=")).toBe(true);
    // El '+' de "+40 pts" tiene que ir como %2B: sin codificar, WhatsApp lo lee como
    // un espacio y el mensaje llega diciendo "40 pts".
    expect(url).toContain("%2B40%20pts");
  });

  it("conserva los saltos de línea del resumen", () => {
    expect(enlaceWhatsApp("3204537010", "linea1\nlinea2")).toContain("linea1%0Alinea2");
  });

  it("devuelve cadena vacía si el número no es válido, en vez de un enlace roto", () => {
    expect(enlaceWhatsApp("no-es-un-numero", "hola")).toBe("");
  });
});

describe("formatearNumeroLegible", () => {
  it("muestra los números colombianos como se leen aquí", () => {
    expect(formatearNumeroLegible("+573204537010")).toBe("320 4537010");
    expect(formatearNumeroLegible("+573108043958")).toBe("310 8043958");
  });

  it("deja intacto un número extranjero en vez de recortarle el indicativo", () => {
    expect(formatearNumeroLegible("+14155550100")).toBe("+14155550100");
  });
});
