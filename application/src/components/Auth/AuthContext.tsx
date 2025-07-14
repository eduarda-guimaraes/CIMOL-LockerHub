// application/src/components/Auth/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import { UserSession } from "@/types";
// --- MODIFICAÇÃO AQUI ---
import api from "@/lib/api"; // Importando nossa instância centralizada do Axios

interface AuthContextType {
  user: UserSession | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (data: { user: UserSession; accessToken: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- MODIFICAÇÃO AQUI ---
// A instância local 'const api = axios.create()' foi removida.
// Agora usamos a instância importada de '@lib/api'.

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const rehydrateAuth = async () => {
      try {
        // Esta chamada agora usa a instância compartilhada 'api'
        const { data } = await api.post("/api/auth/refresh");
        if (data.accessToken && data.user) {
          setUser(data.user);
          setAccessToken(data.accessToken);
          // E esta configuração é aplicada na instância compartilhada
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${data.accessToken}`;
        }
      } catch (error) {
        console.error("Erro ao re-hidratar a sessão:", error);
        console.log("Nenhuma sessão ativa para re-hidratar.");
      } finally {
        setIsLoading(false);
      }
    };

    rehydrateAuth();
  }, []);

  const login = (data: { user: UserSession; accessToken: string }) => {
    setUser(data.user);
    setAccessToken(data.accessToken);
    // A configuração agora é feita na instância compartilhada
    api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
    router.push("/dashboard");
  };

  const logout = async () => {
    try {
      // A chamada de logout usa a instância compartilhada
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Falha ao fazer logout no servidor:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      // O header é removido da instância compartilhada
      delete api.defaults.headers.common["Authorization"];
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
