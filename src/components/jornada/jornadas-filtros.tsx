"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TODOS = "__todos__";

interface Opcion {
  value: string;
  label: string;
}

export function JornadasFiltros({
  usuarios,
  proyectos,
  mostrarUsuario,
}: {
  usuarios: Opcion[];
  proyectos: Opcion[];
  mostrarUsuario: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const desde = searchParams.get("desde") ?? "";
  const hasta = searchParams.get("hasta") ?? "";
  const uid = searchParams.get("uid") ?? "";
  const proyectoId = searchParams.get("proyecto") ?? "";

  const actualizar = (cambios: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(cambios)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    router.push(`/jornadas?${params.toString()}`);
  };

  const items = (opciones: Opcion[], etiqueta: string) => ({
    [TODOS]: `${etiqueta}: todos`,
    ...Object.fromEntries(opciones.map((o) => [o.value, o.label])),
  });

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">Desde</label>
        <Input type="date" value={desde} onChange={(e) => actualizar({ desde: e.target.value })} className="w-[150px]" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">Hasta</label>
        <Input type="date" value={hasta} onChange={(e) => actualizar({ hasta: e.target.value })} className="w-[150px]" />
      </div>

      {mostrarUsuario && (
        <Select
          value={uid || TODOS}
          items={items(usuarios, "Usuario")}
          onValueChange={(v) => actualizar({ uid: !v || v === TODOS ? "" : v })}
        >
          <SelectTrigger size="sm" className="min-w-[160px]">
            <SelectValue placeholder="Usuario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Usuario: todos</SelectItem>
            {usuarios.map((u) => (
              <SelectItem key={u.value} value={u.value}>
                {u.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={proyectoId || TODOS}
        items={items(proyectos, "Proyecto")}
        onValueChange={(v) => actualizar({ proyecto: !v || v === TODOS ? "" : v })}
      >
        <SelectTrigger size="sm" className="min-w-[180px]">
          <SelectValue placeholder="Proyecto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Proyecto: todos</SelectItem>
          {proyectos.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="sm" onClick={() => router.push("/jornadas")}>
        Limpiar filtros
      </Button>
    </div>
  );
}
