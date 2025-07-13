// application/src/components/Auth/AdminProtectedRoute.tsx
"use client";

import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function AdminProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se o usuário está carregado e não é admin, redireciona
    if (user && user.role !== "admin") {
      router.replace("/dashboard"); // Redireciona para uma página segura não-admin
    }
  }, [user, router]);

  // Se o usuário for admin, renderiza o conteúdo
  if (user && user.role === "admin") {
    return <>{children}</>;
  }

  // Enquanto carrega ou se não for admin, não renderiza nada (ProtectedRoute já mostra o loader)
  return null;
}
