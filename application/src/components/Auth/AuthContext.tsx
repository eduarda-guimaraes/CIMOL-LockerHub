// application/src/components/Auth/AuthContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// --- MODIFICAÇÃO AQUI: Criação do Contexto de Autenticação ---

interface User {
  id: string;
  email: string;
  role: "admin" | "coordinator";
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (data: { user: User; accessToken: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa como true para verificações iniciais
  const router = useRouter();

  // TODO: Adicionar um useEffect aqui para verificar o refresh token no futuro
  // e manter o usuário logado entre as atualizações da página.
  // Por enquanto, vamos manter o estado em memória.
  useState(() => {
    setIsLoading(false);
  });

  const login = (data: { user: User; accessToken: string }) => {
    setUser(data.user);
    setAccessToken(data.accessToken);
    // TODO: Configurar o header de autorização padrão do axios
    // axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
    router.push("/dashboard");
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Falha ao fazer logout no servidor:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      // delete axios.defaults.headers.common['Authorization'];
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
