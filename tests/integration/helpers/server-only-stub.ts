// Stub para el paquete "server-only": su export real lanza a menos que un bundler (el webpack
// de Next.js) lo resuelva a un no-op. Vitest corre en Node puro, nunca en el navegador, así
// que la protección no aplica aquí — se alias este archivo vacío en vitest.integration.config.mts.
export {};
