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
import axios, { AxiosError } from "axios";
import { useAuth } from "@/components/Auth/AuthContext";

// --- MODIFICAÇÃO AQUI: Refatoração completa da página de login ---

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  senha: z.string().min(1, { message: "A senha é obrigatória." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth(); // Usando nosso contexto de autenticação

  const {
    mutate: loginUser,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const payload = { email: data.email, password: data.senha };
      const { data: responseData } = await axios.post(
        "/api/auth/login",
        payload
      );
      return responseData;
    },
    onSuccess: (data) => {
      // Chama a função de login do contexto para atualizar o estado global
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

  const apiErrorMessage =
    error instanceof AxiosError ? error.response?.data?.message : null;

  return (
    <main className="flex h-screen w-full">
      <section className="w-1/2 bg-blue-900 text-white flex flex-col items-start justify-center p-8">
        <h1 className={`text-4xl font-bold mb-4 ${poppins.className}`}>
          Bem-vindo!
        </h1>
        <p className="max-w-md text-left px-2">
          Entre com as suas informações principais. Se ainda não tiver uma
          conta,{" "}
          <Link
            href="/cadastro"
            className="underline text-blue-200 hover:text-white"
          >
            Crie uma
          </Link>
          .
        </p>
      </section>

      <section className="w-1/2 bg-white flex flex-col justify-center items-center p-10">
        <h2
          className={`text-2xl font-bold text-gray-800 mb-6 ${poppins.className}`}
        >
          Faça Login
        </h2>
        <div className="flex gap-4 mb-6">
          <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">
            f
          </button>
          <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">
            G
          </button>
          <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">
            in
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Ou use seu email e senha</p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-3/4 max-w-md gap-4"
        >
          <div>
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              {...register("senha")}
              className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.senha && (
              <p className="text-red-500 text-xs mt-1">
                {errors.senha.message}
              </p>
            )}
          </div>

          {apiErrorMessage && (
            <p className="text-red-500 text-sm">{apiErrorMessage}</p>
          )}

          <div className="text-right">
            <Link
              href="/recuperar-senha"
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Esqueceu sua Senha?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-4 bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-md font-semibold disabled:bg-gray-400"
          >
            {isPending ? "Entrando..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}