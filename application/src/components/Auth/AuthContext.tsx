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
import { UserSession } from "@/types";

interface AuthContextType {
  user: UserSession | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (data: { user: UserSession; accessToken: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const api = axios.create();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      } catch (error) {
        console.error("Erro ao re-hidratar a autenticação:", error);
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
