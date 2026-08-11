"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { importarProyectoJSON } from "@/app/(app)/proyectos/actions";

export function ImportarJsonBoton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite reimportar el mismo archivo
    if (!file) return;

    setPending(true);
    try {
      const texto = await file.text();
      const datos = JSON.parse(texto);
      const { id } = await importarProyectoJSON(datos);
      toast.success(`Proyecto "${datos.nombre}" importado.`);
      router.push(`/proyectos/${id}`);
    } catch (err) {
      toast.error(
        err instanceof SyntaxError
          ? "No se pudo leer el JSON: archivo inválido."
          : err instanceof Error
            ? err.message
            : "No se pudo importar el proyecto.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={onFile} />
      <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={pending}>
        {pending ? "Importando…" : "Importar JSON"}
      </Button>
    </>
  );
}
