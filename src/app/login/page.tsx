import { IconBolt } from "@tabler/icons-react";

// Placeholder — el flujo real de login (Firebase Auth + POST /api/session) es el Paso 12.
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-foreground">
      <IconBolt size={32} className="text-primary" />
      <h1 className="text-lg font-medium">MEP Manager</h1>
      <p className="text-sm text-muted-foreground">Inicio de sesión pendiente (Paso 12).</p>
    </div>
  );
}
