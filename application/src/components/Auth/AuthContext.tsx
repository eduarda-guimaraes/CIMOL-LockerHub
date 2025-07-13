// application/src/components/Auth/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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

// --- MODIFICAÇÃO AQUI: Configurando o Axios e adicionando re-hidratação ---
const api = axios.create();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa true para a verificação inicial
  const router = useRouter();

  useEffect(() => {
    const rehydrateAuth = async () => {
      try {
        const { data } = await api.post("/api/auth/refresh");
        if (data.accessToken && data.user) {
          setUser(data.user);
          setAccessToken(data.accessToken);
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${data.accessToken}`;
        }
      } catch {
        console.log("Nenhuma sessão ativa para re-hidratar.");
        // Falha em re-hidratar é normal se o usuário não estiver logado
      } finally {
        setIsLoading(false); // Termina o carregamento, independentemente do resultado
      }
    };

    rehydrateAuth();
  }, []); // Array vazio garante que isso rode apenas uma vez

  const login = (data: { user: User; accessToken: string }) => {
    setUser(data.user);
    setAccessToken(data.accessToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
    router.push("/dashboard");
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Falha ao fazer logout no servidor:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
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
