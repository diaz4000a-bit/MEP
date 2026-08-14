import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const raizProyecto = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Turbopack infiere la raíz del workspace buscando lockfiles hacia arriba y encontraba un
  // package-lock.json FUERA del repo, lo que puede resolver módulos desde el árbol
  // equivocado. Fijarla a este directorio elimina el aviso y la ambigüedad.
  turbopack: { root: raizProyecto },

  // firebase-admin (vía jwks-rsa -> jose) rompe el bundling serverless de Vercel con
  // ERR_REQUIRE_ESM si se empaqueta; se dejan como módulos externos de node_modules en
  // runtime para que los resuelva el require() nativo de Node, no el bundler.
  serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose"],
};

export default nextConfig;
