"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { enlaceWhatsApp, formatearNumeroLegible } from "@/lib/whatsapp";

const TODOS = "__todos__";

function hoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface Resumen {
  texto: string;
  destinos: string[];
  enviable: boolean;
  motivo?: string;
}

export function InformeDialog({ proyectoId, responsables }: { proyectoId: string; responsables: string[] }) {
  const [open, setOpen] = useState(false);
  const [fecha, setFecha] = useState(hoy());
  const [resp, setResp] = useState("");
  // La respuesta se guarda junto a la clave que la pidió. Así "todavía cargando" se DEDUCE
  // (la clave guardada no es la actual) en vez de escribirse con un setState al entrar al
  // efecto, que encadena un render extra en cada cambio de fecha.
  const clave = `${proyectoId}|${fecha}`;
  const [respuesta, setRespuesta] = useState<{ clave: string; datos: Resumen | null; error: string } | null>(null);

  // El texto se precarga al abrir el diálogo y cada vez que cambia la fecha, para que al
  // pulsar el botón el enlace de WhatsApp ya exista. Si se pidiera dentro del onClick, el
  // navegador bloquearía la ventana por abrirse después de un `await`, fuera del gesto.
  useEffect(() => {
    if (!open) return;

    // Abortar y comparar la clave cubren la misma carrera por los dos lados: al cambiar de
    // fecha varias veces seguidas, la respuesta más lenta no puede pisar a la más reciente
    // ni acabar armando el enlace con el informe de otro día.
    const corte = new AbortController();

    fetch(`/api/informe/${proyectoId}/resumen?fecha=${fecha}`, { signal: corte.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`No se pudo preparar el resumen (HTTP ${r.status}).`);
        setRespuesta({ clave, datos: (await r.json()) as Resumen, error: "" });
      })
      .catch((err: unknown) => {
        if (corte.signal.aborted) return;
        setRespuesta({ clave, datos: null, error: err instanceof Error ? err.message : "No se pudo preparar el resumen." });
      });

    return () => corte.abort();
  }, [open, clave, proyectoId, fecha]);

  const vigente = respuesta?.clave === clave ? respuesta : null;
  const resumen = vigente?.datos ?? null;
  const errorResumen = vigente?.error ?? "";

  const generar = () => {
    const params = new URLSearchParams({ fecha });
    if (resp) params.set("resp", resp);
    window.open(`/api/informe/${proyectoId}?${params.toString()}`, "_blank");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Informe diario</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Informe de progreso diario</DialogTitle>
          <DialogDescription>
            Incluye las tareas con avance o cambio de estado en la fecha elegida, y la jornada registrada de cada
            trabajador. Se abre listo para imprimir o guardar como PDF.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inf-fecha">Fecha del informe</Label>
            <Input id="inf-fecha" type="date" value={fecha} max={hoy()} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="inf-resp">Trabajador</Label>
            <Select
              value={resp || TODOS}
              items={{ [TODOS]: "Todos los trabajadores", ...Object.fromEntries(responsables.map((r) => [r, r])) }}
              onValueChange={(v) => setResp(!v || v === TODOS ? "" : v)}
            >
              <SelectTrigger id="inf-resp" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos los trabajadores</SelectItem>
                {responsables.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-foreground/10 pt-3">
            <Label>Enviar resumen por WhatsApp</Label>
            {errorResumen && <p className="text-xs text-estado-bloqueada">{errorResumen}</p>}
            {!errorResumen && !resumen && <p className="text-xs text-muted-foreground">Preparando el resumen…</p>}
            {resumen && !resumen.enviable && <p className="text-xs text-muted-foreground">{resumen.motivo}</p>}
            {resumen?.enviable && (
              <>
                {/* Se muestra el texto exacto antes de abrir WhatsApp: el envío lo confirma
                    la persona, y confirmar a ciegas lo que se manda al cliente no es confirmar. */}
                <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-2 text-xs text-muted-foreground">
                  {resumen.texto}
                </pre>
                <div className="flex flex-wrap gap-2">
                  {resumen.destinos.map((numero) => (
                    <Button
                      key={numero}
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={
                        <a
                          href={enlaceWhatsApp(numero, resumen.texto)}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      WhatsApp · {formatearNumeroLegible(numero)}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Abre WhatsApp con el mensaje escrito; el envío lo confirmas tú. El resumen cubre al equipo
                  completo: no aplica el filtro por trabajador.
                </p>
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={generar}>Generar PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
