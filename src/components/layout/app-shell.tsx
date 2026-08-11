"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { PaletaBusqueda } from "@/components/busqueda/paleta-busqueda";
import { BarraJornada } from "@/components/jornada/barra-jornada";
import { icono } from "@/lib/icons";
import type { ItemBusqueda } from "@/lib/busqueda";
import type { Rol } from "@/types";
import { NavContent } from "./nav-content";
import { UserMenu } from "./user-menu";

interface ProyectoResumen {
  id: string;
  nombre: string;
  avanceTotal: number;
}

const IconMenu = icono("ti-menu-2");

export function AppShell({
  usuario,
  proyectos,
  indiceBusqueda,
  children,
}: {
  usuario: { uid: string; nombre: string; rol: Rol };
  proyectos: ProyectoResumen[];
  indiceBusqueda: ItemBusqueda[];
  children: React.ReactNode;
}) {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar de escritorio */}
      <aside className="hidden w-[230px] shrink-0 border-r border-sidebar-border md:block">
        <div className="fixed h-screen w-[230px]">
          <NavContent rol={usuario.rol} proyectos={proyectos} />
        </div>
      </aside>

      {/* Sidebar móvil */}
      <Sheet open={sidebarAbierto} onOpenChange={setSidebarAbierto}>
        <SheetContent side="left" className="w-[260px] p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <NavContent
            rol={usuario.rol}
            proyectos={proyectos}
            onNavigate={() => setSidebarAbierto(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur-sm supports-backdrop-filter:bg-background/75">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menú"
            onClick={() => setSidebarAbierto(true)}
          >
            <IconMenu size={20} />
          </Button>

          <div className="flex-1" />

          <PaletaBusqueda items={indiceBusqueda} />

          <UserMenu nombre={usuario.nombre} rol={usuario.rol} />
        </header>

        <BarraJornada uid={usuario.uid} proyectos={proyectos} />

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      <Toaster theme="dark" />
    </div>
  );
}
