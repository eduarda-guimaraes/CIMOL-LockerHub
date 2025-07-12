// application/src/components/Providers.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "./Auth/AuthContext"; // Importar o AuthProvider

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {/* --- MODIFICAÇÃO AQUI: Envolvendo com o AuthProvider --- */}
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
