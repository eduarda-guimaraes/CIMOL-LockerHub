// application/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // --- MODIFICAÇÃO AQUI: Adicionando a regra de redirecionamento ---
  async redirects() {
    return [
      {
        source: "/", // A rota de origem
        destination: "/login", // A rota de destino
        permanent: true, // Indica um redirecionamento 308 (permanente)
      },
    ];
  },
};

export default nextConfig;
