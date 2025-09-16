"use client";

import Link from "next/link";
import { Poppins } from "next/font/google";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { useState } from "react";

const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700"] });

const schema = z.object({
  email: z.string().email({ message: "Informe um email válido." }),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [devLink, setDevLink] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: async (data: FormData) => {
      const res: AxiosResponse<{ message: string; devLink?: string }> = await axios.post(
        "/api/auth/forgot-password",
        data
      );
      setDevLink(res.data.devLink ?? null);
    },
  });

  const copy = async () => {
    if (!devLink) return;
    try {
      await navigator.clipboard.writeText(devLink);
      alert("Link copiado!");
    } catch {
      // fallback simples
      window.prompt("Copie o link:", devLink);
    }
  };

  return (
    <main className="flex h-screen w-full">
      <section className="w-1/2 bg-blue-900 text-white flex flex-col items-start justify-center p-8">
        <h1 className={`text-4xl font-bold mb-4 ${poppins.className}`}>Recuperar acesso</h1>
        <p className="max-w-md text-left px-2">
          Informe seu email e enviaremos um link para redefinição de senha.
        </p>
      </section>

      <section className="w-1/2 bg-white flex flex-col justify-center items-center p-10">
        <h2 className={`text-2xl font-bold text-gray-800 mb-6 ${poppins.className}`}>
          Esqueceu sua senha
        </h2>

        {isSuccess ? (
          <div className="w-3/4 max-w-md space-y-3">
            <div className="p-4 rounded-md bg-green-50 text-green-700 border border-green-200">
              Se o email existir, enviamos um link de redefinição. Confira sua caixa de entrada.
            </div>

            {devLink && (
              <div className="p-4 rounded-md bg-gray-50 text-gray-700 border border-gray-200">
                <p className="font-semibold mb-1">Ambiente de desenvolvimento:</p>
                <p className="text-sm break-all">{devLink}</p>
                <button
                  onClick={copy}
                  className="mt-3 bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded-md font-semibold"
                >
                  Copiar link
                </button>
              </div>
            )}

            <div className="text-center text-sm mt-2">
              <Link href="/login" className="text-gray-400 hover:text-gray-600">
                Voltar para o login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit((d) => mutate(d))}
                className="flex flex-col w-3/4 max-w-md gap-4">
            <div>
              <input
                type="email"
                placeholder="Seu email"
                {...register("email")}
                className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-md font-semibold disabled:bg-gray-400"
            >
              {isPending ? "Enviando..." : "Enviar link"}
            </button>

            <div className="text-center text-sm mt-2">
              <Link href="/login" className="text-gray-400 hover:text-gray-600">
                Voltar para o login
              </Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}