// application/src/app/(auth)/login/page.tsx
"use client";

import Link from "next/link";
import { Poppins } from "next/font/google";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/components/Auth/AuthContext";
import Spinner from '@/components/ui/Spinner';
import { UserSession } from "@/types";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  senha: z.string().min(1, { message: "A senha é obrigatória." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginResponse {
  user: UserSession;
  accessToken: string;
}

// --- CORREÇÃO FINAL E DEFINITIVA ---

// 1. Definimos a "forma" que um erro da nossa API tem
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// 2. Criamos uma função "Type Guard"
// Ela verifica se o erro tem a "forma" de um ApiError
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const {
    mutate: loginUser,
    isPending,
    error,
  } = useMutation<LoginResponse, unknown, LoginFormData>({
    mutationFn: async (data: LoginFormData) => {
      const payload = { email: data.email, password: data.senha };
      const { data: responseData } = await axios.post<LoginResponse>("/api/auth/login", payload);
      return responseData;
    },
    onSuccess: (data) => {
      login({ user: data.user, accessToken: data.accessToken });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginUser(data);
  };

  // 3. Usamos nossa função Type Guard
  let apiErrorMessage: string | null = null;
  if (isApiError(error)) {
    // Dentro deste bloco, o TypeScript sabe que 'error' tem a propriedade 'response'
    apiErrorMessage = error.response?.data?.message || "Ocorreu um erro de comunicação.";
  }

  return (
    <main className="flex h-screen w-full bg-white">
      <section className="hidden md:flex w-1/2 bg-brand-blue-dark text-white flex-col items-center justify-center p-10 text-center">
        <h1 className={`text-4xl font-bold mb-4 ${poppins.className}`}>Bem-vindo de volta!</h1>
        <p className="max-w-xs px-2">Acesse o painel para gerenciar os armários do seu curso. Ainda não tem uma conta? <Link href="/cadastro" className="font-semibold underline hover:text-gray-200">Crie uma</Link>.</p>
      </section>

      <section className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <h2 className={`text-3xl font-bold text-brand-gray-dark mb-4 ${poppins.className}`}>Faça Login</h2>
          <p className="text-sm text-brand-gray mb-8">Use seu email e senha para continuar.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full gap-5">
            <div>
              <input type="email" placeholder="Email" {...register("email")} className="form-input" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="Senha" {...register("senha")} className="form-input pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.senha && <p className="text-red-500 text-xs mt-1">{errors.senha.message}</p>}
            </div>
            {apiErrorMessage && <p className="text-red-500 text-sm text-center">{apiErrorMessage}</p>}
            <div className="text-right"><Link href="/recuperar-senha" className="text-sm text-brand-gray hover:text-brand-blue">Esqueceu sua Senha?</Link></div>
            <button type="submit" disabled={isPending} className="btn-primary">{isPending && <Spinner />} {isPending ? "Entrando..." : "Login"}</button>
          </form>
        </div>
      </section>
    </main>
  );
}