"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Rol, Usuario } from "@/types";
import { actualizarUsuario } from "@/app/(app)/usuarios/actions";

const ROLES: Rol[] = ["admin", "coordinador", "ingeniero", "modelador", "usuario"];

function fechaLegible(ms: number) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export function UsuariosTable({ usuarios, uidActual }: { usuarios: Usuario[]; uidActual: string }) {
  const [pending, startTransition] = useTransition();

  const cambiarRol = (uid: string, rol: Rol) => {
    startTransition(async () => {
      try {
        await actualizarUsuario(uid, { rol });
        toast.success("Rol actualizado.");
      } catch {
        toast.error("No se pudo actualizar el rol.");
      }
    });
  };

  const cambiarActivo = (uid: string, activo: boolean) => {
    startTransition(async () => {
      try {
        await actualizarUsuario(uid, { activo });
        toast.success(activo ? "Usuario activado." : "Usuario desactivado.");
      } catch {
        toast.error("No se pudo actualizar el estado.");
      }
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Activo</TableHead>
          <TableHead>Último acceso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {usuarios.map((u) => {
          const esUno = u.uid === uidActual;
          return (
            <TableRow key={u.uid}>
              <TableCell className="font-medium">
                {u.nombre}
                {esUno && (
                  <Badge variant="secondary" className="ml-2">
                    Tú
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell>
                <Select
                  value={u.rol}
                  onValueChange={(v) => cambiarRol(u.uid, v as Rol)}
                  disabled={pending || esUno}
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Switch
                  checked={u.activo}
                  onCheckedChange={(v) => cambiarActivo(u.uid, v)}
                  disabled={pending || esUno}
                />
              </TableCell>
              <TableCell className="text-muted-foreground">{fechaLegible(u.ultimoAcceso)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
