// Placeholder — la gestión real de zonas (crear/borrar, vista de zona, navegación) es el Paso 14.
export function ZonasCardStub({ zonas }: { zonas: string[] }) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <h3 className="text-sm font-medium">Zonas / Modelos del proyecto</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {zonas.length > 0 ? zonas.join(" · ") : "Sin zonas definidas."} — gestión completa pendiente (Paso 14).
      </p>
    </div>
  );
}
