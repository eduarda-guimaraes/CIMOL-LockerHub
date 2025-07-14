// application/src/components/Auth/ProtectedRoute.tsx
"use client";

import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

// --- MODIFICAÇÃO AQUI: Criação do componente de Rota Protegida ---

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se o carregamento inicial terminou e não há usuário, redireciona para o login.
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Enquanto o estado de autenticação está sendo verificado, exibe um loader.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  // Se o usuário está autenticado, renderiza o conteúdo da página protegida.
  if (user) {
    return <>{children}</>;
  }

  // Se não estiver autenticado e o redirecionamento ainda não ocorreu, não renderiza nada.
  return null;
}
