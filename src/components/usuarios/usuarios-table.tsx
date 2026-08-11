"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { actualizarUsuario, eliminarUsuario } from "@/app/(app)/usuarios/actions";

const ROLES: Rol[] = ["admin", "coordinador", "ingeniero", "modelador", "usuario"];

function fechaLegible(ms: number) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export function UsuariosTable({ usuarios, uidActual }: { usuarios: Usuario[]; uidActual: string }) {
  const [pending, startTransition] = useTransition();
  const [aEliminar, setAEliminar] = useState<Usuario | null>(null);

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

  const confirmarEliminar = () => {
    if (!aEliminar) return;
    const uid = aEliminar.uid;
    setAEliminar(null);
    startTransition(async () => {
      try {
        await eliminarUsuario(uid);
        toast.success("Usuario eliminado.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "No se pudo eliminar el usuario.");
      }
    });
  };

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Activo</TableHead>
          <TableHead>Último acceso</TableHead>
          <TableHead className="w-0" />
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
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={pending || esUno}
                  onClick={() => setAEliminar(u)}
                  aria-label={`Eliminar a ${u.nombre}`}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
    <AlertDialog open={aEliminar !== null} onOpenChange={(open) => !open && setAEliminar(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar a {aEliminar?.nombre}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción borra su cuenta y acceso de forma permanente. No se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmarEliminar}>Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
