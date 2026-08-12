"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cambiarProyectoJornada, registrarEntrada, registrarSalida } from "@/app/(app)/jornadas/actions";
import { db } from "@/lib/firebase/client";
import { esJornadaColgada, formatearDuracion, formatearHora } from "@/lib/jornadas";
import type { Jornada } from "@/types";

// "YYYY-MM-DDTHH:mm" en hora local, valor por defecto de un <input type="datetime-local">
function aInputLocal(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface ProyectoOpcion {
  id: string;
  nombre: string;
}

export function BarraJornada({ uid, proyectos }: { uid: string; proyectos: ProyectoOpcion[] }) {
  const [jornadaAbierta, setJornadaAbierta] = useState<Jornada | null | undefined>(undefined);
  const [proyectoId, setProyectoId] = useState(proyectos[0]?.id ?? "");
  const [ahora, setAhora] = useState(() => Date.now());
  const [pending, startTransition] = useTransition();
  const [dialogSalidaAbierto, setDialogSalidaAbierto] = useState(false);
  const [horaSalidaManual, setHoraSalidaManual] = useState("");

  useEffect(() => {
    const q = query(collection(db, "jornadas"), where("uid", "==", uid), where("estado", "==", "abierta"));
    return onSnapshot(
      q,
      (snap) => setJornadaAbierta(snap.empty ? null : (snap.docs[0].data() as Jornada)),
      () => toast.error("Se perdió la sincronización de la jornada."),
    );
  }, [uid]);

  useEffect(() => {
    if (!jornadaAbierta) return;
    const id = setInterval(() => setAhora(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [jornadaAbierta]);

  const entrar = () => {
    if (!proyectoId) return toast.error("Selecciona un proyecto.");
    startTransition(async () => {
      try {
        await registrarEntrada({ proyectoId });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo registrar la entrada.");
      }
    });
  };

  const salir = (jornadaId: string, horaSalida?: number) => {
    startTransition(async () => {
      try {
        await registrarSalida({ jornadaId, horaSalida });
        setDialogSalidaAbierto(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo registrar la salida.");
      }
    });
  };

  const confirmarSalidaManual = () => {
    if (!jornadaAbierta || !horaSalidaManual) return;
    const ms = new Date(horaSalidaManual).getTime();
    if (Number.isNaN(ms)) return toast.error("Hora inválida.");
    salir(jornadaAbierta.id, ms);
  };

  const cambiarProyecto = (nuevoProyectoId: string) => {
    if (!jornadaAbierta || !nuevoProyectoId || nuevoProyectoId === jornadaAbierta.proyectoId) return;
    startTransition(async () => {
      try {
        await cambiarProyectoJornada({ proyectoId: nuevoProyectoId });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo cambiar de proyecto.");
      }
    });
  };

  if (jornadaAbierta === undefined) return null; // aún cargando el estado inicial

  if (jornadaAbierta) {
    const colgada = esJornadaColgada(jornadaAbierta.entrada);
    const minutos = Math.round((ahora - jornadaAbierta.entrada) / 60000);
    return (
      <div
        className={`flex flex-wrap items-center gap-3 border-b px-4 py-2 text-sm ${
          colgada ? "border-estado-bloqueada/30 bg-estado-bloqueada/10" : "border-border bg-muted/40"
        }`}
      >
        <span className={`size-2 rounded-full ${colgada ? "bg-estado-bloqueada" : "bg-estado-completada"}`} />
        <span>
          {colgada ? "Jornada sin cerrar" : "En jornada"} · desde {formatearHora(jornadaAbierta.entrada)} ·{" "}
          {formatearDuracion(minutos)}
        </span>
        <Select
          value={jornadaAbierta.proyectoId}
          items={Object.fromEntries(proyectos.map((p) => [p.id, p.nombre]))}
          onValueChange={(v) => v && cambiarProyecto(v)}
          disabled={pending}
        >
          <SelectTrigger size="sm" className="min-w-[180px]">
            <SelectValue placeholder="Selecciona un proyecto" />
          </SelectTrigger>
          <SelectContent>
            {proyectos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (colgada) {
              setHoraSalidaManual(aInputLocal(Date.now()));
              setDialogSalidaAbierto(true);
            } else {
              salir(jornadaAbierta.id);
            }
          }}
          disabled={pending}
        >
          Registrar salida
        </Button>

        <Dialog open={dialogSalidaAbierto} onOpenChange={setDialogSalidaAbierto}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Jornada sin cerrar</DialogTitle>
              <DialogDescription>
                Lleva abierta más de 16 horas. Indica la hora real de salida — no se cierra sola para no
                inventar horas.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hora-salida-manual">Hora de salida</Label>
              <Input
                id="hora-salida-manual"
                type="datetime-local"
                value={horaSalidaManual}
                onChange={(e) => setHoraSalidaManual(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogSalidaAbierto(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmarSalidaManual} disabled={pending}>
                Confirmar salida
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-4 py-2">
      <Select value={proyectoId} items={Object.fromEntries(proyectos.map((p) => [p.id, p.nombre]))} onValueChange={(v) => v && setProyectoId(v)}>
        <SelectTrigger size="sm" className="min-w-[180px]">
          <SelectValue placeholder="Selecciona un proyecto" />
        </SelectTrigger>
        <SelectContent>
          {proyectos.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" onClick={entrar} disabled={pending || proyectos.length === 0}>
        Registrar entrada
      </Button>
    </div>
  );
}
