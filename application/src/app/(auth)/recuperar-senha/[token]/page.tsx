"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";

const schema = z
  .object({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  // estados para mostrar/ocultar senha
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await axios.post("/api/auth/reset-password", {
        token,
        password: data.password,
      });
      return res.data;
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    },
  });

  const onSubmit = (data: FormData) => mutate(data);

  const apiErrorMessage =
    error instanceof AxiosError ? error.response?.data?.message : null;

  return (
    <main className="flex h-screen w-full">
      <section className="w-1/2 bg-blue-900 text-white flex flex-col items-start justify-center p-8">
        <h1 className="text-4xl font-bold mb-4">Redefinir senha</h1>
        <p className="max-w-md text-left px-2">
          Digite sua nova senha para acessar novamente o CIMOL LockerHub.
        </p>
      </section>

      <section className="w-1/2 bg-white flex flex-col justify-center items-center p-10">
        {success ? (
          <div className="p-4 rounded-md bg-green-50 text-green-700 border border-green-200">
            Senha alterada com sucesso! Redirecionando para login...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col w-3/4 max-w-md gap-4"
          >
            {/* Nova senha */}
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Nova senha"
                {...register("password")}
                className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-md bg-gray-100 text-gray-700"
              />
              <button
                type="button"
                aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirmar nova senha */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmar nova senha"
                {...register("confirmPassword")}
                className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-md bg-gray-100 text-gray-700"
              />
              <button
                type="button"
                aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {apiErrorMessage && (
              <p className="text-red-500 text-sm">{apiErrorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-4 bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-md font-semibold disabled:bg-gray-400"
            >
              {isPending ? "Enviando..." : "Redefinir senha"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}