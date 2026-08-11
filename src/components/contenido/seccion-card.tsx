import type { ReactNode } from "react";

export function SinDato({ className }: { className?: string }) {
  return <span className={`text-sm text-muted-foreground italic ${className ?? ""}`}>Sin información.</span>;
}

export function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <h3 className="text-sm font-medium">{titulo}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

export function SeccionLista({ titulo, items, numerada }: { titulo: string; items: string[]; numerada?: boolean }) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <h3 className="text-sm font-medium">{titulo}</h3>
      {items.length === 0 ? (
        <SinDato className="mt-2" />
      ) : numerada ? (
        <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-4 text-sm text-muted-foreground">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      ) : (
        <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-sm text-muted-foreground">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
