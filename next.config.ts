import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents fica desligado: o painel é todo autenticado e dinâmico, e o
  // modelo clássico de renderização é mais simples para a equipe (docs/PLANEJAMENTO.md §4).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
