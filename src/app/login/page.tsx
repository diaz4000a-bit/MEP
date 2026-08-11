"use client";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { IconBolt } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase/client";
import type { Usuario } from "@/types";

type Modo = "login" | "registro" | "recuperar";

async function crearSesion(idToken: string) {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("No se pudo crear la sesión. Vuelve a intentarlo.");
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const volver = searchParams.get("volver");

  const [modo, setModo] = useState<Modo>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [esperandoAprobacion, setEsperandoAprobacion] = useState(false);

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "usuarios", cred.user.uid));
      const datos = snap.data() as Usuario | undefined;
      if (!datos?.activo) {
        setEsperandoAprobacion(true);
        return;
      }
      const idToken = await cred.user.getIdToken();
      await crearSesion(idToken);
      router.push(volver ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  };

  const registrarse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const nuevoUsuario: Usuario = {
        uid: cred.user.uid,
        email,
        nombre,
        rol: "usuario",
        activo: false,
        creado: Date.now(),
        ultimoAcceso: Date.now(),
        guiaLeidas: [],
      };
      await setDoc(doc(db, "usuarios", cred.user.uid), nuevoUsuario);
      setEsperandoAprobacion(true);
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("email-already-in-use")
          ? "Ese correo ya tiene una cuenta."
          : "No se pudo crear la cuenta.",
      );
    } finally {
      setCargando(false);
    }
  };

  const recuperarContrasena = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMensaje("Te enviamos un correo para restablecer tu contraseña.");
    } catch {
      setError("No se pudo enviar el correo de recuperación.");
    } finally {
      setCargando(false);
    }
  };

  if (esperandoAprobacion) {
    return (
      <Centro>
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center text-center">
            <IconBolt size={28} className="text-primary" />
            <CardTitle>Tu cuenta espera aprobación</CardTitle>
            <CardDescription>
              Un administrador debe activar tu acceso antes de que puedas entrar. Te avisamos
              cuando esté listo.
            </CardDescription>
          </CardHeader>
        </Card>
      </Centro>
    );
  }

  return (
    <Centro>
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <IconBolt size={28} className="text-primary" />
          <CardTitle>MEP Manager</CardTitle>
          <CardDescription>
            {modo === "login" && "Ingresa con tu cuenta"}
            {modo === "registro" && "Crea una cuenta nueva"}
            {modo === "recuperar" && "Recupera tu contraseña"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3"
            onSubmit={modo === "login" ? iniciarSesion : modo === "registro" ? registrarse : recuperarContrasena}
          >
            {modo === "registro" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {modo !== "recuperar" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
            {mensaje && <p className="text-xs text-muted-foreground">{mensaje}</p>}

            <Button type="submit" disabled={cargando} className="mt-1">
              {cargando
                ? "Un momento…"
                : modo === "login"
                  ? "Ingresar"
                  : modo === "registro"
                    ? "Crear cuenta"
                    : "Enviar correo"}
            </Button>
          </form>

          <div className="mt-4 flex flex-col gap-1 text-center text-xs text-muted-foreground">
            {modo === "login" && (
              <>
                <button className="hover:text-foreground" onClick={() => { setModo("recuperar"); setError(null); }}>
                  Olvidé mi contraseña
                </button>
                <button className="hover:text-foreground" onClick={() => { setModo("registro"); setError(null); }}>
                  Crear una cuenta nueva
                </button>
              </>
            )}
            {modo !== "login" && (
              <button className="hover:text-foreground" onClick={() => { setModo("login"); setError(null); setMensaje(null); }}>
                Volver a iniciar sesión
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </Centro>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-background p-4">{children}</div>;
}
