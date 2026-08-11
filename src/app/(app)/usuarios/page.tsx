import { UsuariosTable } from "@/components/usuarios/usuarios-table";
import { exigirRol } from "@/lib/auth/sesion";
import { adminDb } from "@/lib/firebase/admin";
import type { Usuario } from "@/types";

export default async function UsuariosPage() {
  const usuario = await exigirRol("admin");

  const snap = await adminDb.collection("usuarios").orderBy("nombre").get();
  const usuarios = snap.docs.map((doc) => doc.data() as Usuario);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          Activa cuentas nuevas y gestiona los roles del equipo.
        </p>
      </div>
      <UsuariosTable usuarios={usuarios} uidActual={usuario.uid} />
    </div>
  );
}
