"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/firebase/client";
import type { Rol } from "@/types";

const ETIQUETA_ROL: Record<Rol, string> = {
  admin: "Admin",
  coordinador: "Coordinador",
  ingeniero: "Ingeniero",
  modelador: "Modelador",
  usuario: "Usuario",
};

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function UserMenu({ nombre, rol }: { nombre: string; rol: Rol }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const cerrarSesion = () => {
    startTransition(async () => {
      await signOut(auth);
      await fetch("/api/session", { method: "DELETE" });
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 outline-none hover:bg-muted">
        <Avatar size="sm">
          <AvatarFallback>{iniciales(nombre)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">{nombre}</span>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          {ETIQUETA_ROL[rol]}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled className="sm:hidden">
          {nombre} · {ETIQUETA_ROL[rol]}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="sm:hidden" />
        <DropdownMenuItem onClick={cerrarSesion} disabled={pending}>
          {pending ? "Cerrando sesión…" : "Cerrar sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
