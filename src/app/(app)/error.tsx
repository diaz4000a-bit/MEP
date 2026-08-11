"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-destructive">
      <p className="text-sm font-medium">Ocurrió un error al cargar esta sección.</p>
      <p className="text-xs text-destructive/80">{error.message}</p>
      <Button variant="outline" size="sm" className="w-fit" onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
