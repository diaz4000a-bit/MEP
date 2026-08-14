"use client";

import { IconSearch } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { ItemBusqueda } from "@/lib/busqueda";
import { ESTILO_ESTADO } from "@/lib/tareas";

const TIPOS: ItemBusqueda["tipo"][] = ["Proyectos", "Zonas", "Tareas", "Guía"];

function filtroMultiTermino(valor: string, busqueda: string): number {
  const terminos = busqueda.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terminos.length === 0) return 1;
  const objetivo = valor.toLowerCase();
  return terminos.every((t) => objetivo.includes(t)) ? 1 : 0;
}

export function PaletaBusqueda() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ItemBusqueda[] | null>(null);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // El índice se pide al abrir la paleta, no en cada render de página: construirlo en el
  // layout obligaba a leer proyectos y tareas completos en cada navegación y a enviar el
  // índice entero al navegador aunque nadie buscara.
  useEffect(() => {
    if (!open || items !== null) return;
    let vigente = true;
    setError(false);
    fetch("/api/busqueda")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((datos: ItemBusqueda[]) => {
        if (vigente) setItems(datos);
      })
      .catch(() => {
        // Sin índice no hay búsqueda; se avisa en el diálogo en vez de dejar un
        // "Sin resultados" que hace pensar que no hay nada creado.
        if (vigente) setError(true);
      });
    return () => {
      vigente = false;
    };
  }, [open, items]);

  const ir = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <IconSearch size={16} />
        <span className="hidden sm:inline">Buscar…</span>
        <kbd className="hidden rounded border border-border px-1 text-[10px] sm:inline">Ctrl K</kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Buscar"
        description="Buscar proyectos, zonas, tareas y lecciones de la guía"
      >
        <Command filter={filtroMultiTermino}>
          <CommandInput placeholder="Buscar proyectos, zonas, tareas o lecciones…" />
          <CommandList>
            <CommandEmpty>
              {error ? "No se pudo cargar el índice de búsqueda." : items === null ? "Cargando…" : "Sin resultados."}
            </CommandEmpty>
            {TIPOS.map((tipo) => {
              const delTipo = (items ?? []).filter((i) => i.tipo === tipo);
              if (delTipo.length === 0) return null;
              return (
                <CommandGroup key={tipo} heading={tipo}>
                  {delTipo.map((i) => (
                    <CommandItem key={i.id} value={i.key} onSelect={() => ir(i.href)}>
                      <span className="min-w-0 flex-1 truncate">
                        {i.label}
                        {i.sub && <span className="ml-1.5 text-xs text-muted-foreground">{i.sub}</span>}
                      </span>
                      {i.estado && (
                        <Badge variant="secondary" className={ESTILO_ESTADO[i.estado]}>
                          {i.estado}
                        </Badge>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
