"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { icono } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Icon as TablerIcon } from "@tabler/icons-react";
import type { Rol } from "@/types";

interface ProyectoResumen {
  id: string;
  nombre: string;
  avanceTotal: number;
}

interface NavItem {
  href: string;
  label: string;
  Icon: TablerIcon;
  soloRoles?: Rol[];
}

const IconBolt = icono("ti-bolt");
const IconFolder = icono("ti-folders");

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", Icon: icono("ti-layout-dashboard") },
  { href: "/mi-trabajo", label: "Mi trabajo", Icon: icono("ti-clipboard-list") },
  { href: "/proyectos", label: "Proyectos", Icon: icono("ti-folders") },
  { href: "/jornadas", label: "Jornadas", Icon: icono("ti-clock-hour-4") },
  { href: "/guia", label: "Guía", Icon: icono("ti-school") },
  { href: "/equipo", label: "Equipo", Icon: icono("ti-users") },
  { href: "/plantilla", label: "Plantilla", Icon: icono("ti-checklist"), soloRoles: ["admin"] },
  { href: "/usuarios", label: "Usuarios", Icon: icono("ti-user-cog"), soloRoles: ["admin"] },
];

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const activo = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.Icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
        activo && "bg-sidebar-accent text-sidebar-foreground",
      )}
    >
      <Icon size={18} className="shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function NavContent({
  rol,
  proyectos,
  onNavigate,
}: {
  rol: Rol;
  proyectos: ProyectoResumen[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2 px-4 py-4 text-base font-semibold text-sidebar-foreground"
      >
        <IconBolt size={20} className="text-primary" />
        <span>MEP Manager</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
        {NAV_ITEMS.filter((item) => !item.soloRoles || item.soloRoles.includes(rol)).map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}

        {proyectos.length > 0 && (
          <>
            <div className="mt-4 mb-1 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Proyectos
            </div>
            {proyectos.map((p) => {
              const href = `/proyectos/${p.id}`;
              const activo = pathname.startsWith(href);
              return (
                <Link
                  key={p.id}
                  href={href}
                  onClick={onNavigate}
                  title={p.nombre}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    activo && "bg-sidebar-accent text-sidebar-foreground",
                  )}
                >
                  <IconFolder size={18} className="shrink-0" />
                  <span className="flex-1 truncate">{p.nombre}</span>
                  <span className="text-xs text-muted-foreground">{p.avanceTotal}%</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3 text-xs text-muted-foreground">
        Revit MEP Electrical
      </div>
    </div>
  );
}
