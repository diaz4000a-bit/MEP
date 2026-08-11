import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin (vía jwks-rsa -> jose) rompe el bundling serverless de Vercel con
  // ERR_REQUIRE_ESM si se empaqueta; se dejan como módulos externos de node_modules en
  // runtime para que los resuelva el require() nativo de Node, no el bundler.
  serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose"],
};

export default nextConfig;
