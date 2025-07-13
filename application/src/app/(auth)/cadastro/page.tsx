// application/src/app/(auth)/cadastro/page.tsx
"use client";

import Link from "next/link";
import { Poppins } from "next/font/google";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// --- MODIFICAÇÃO AQUI ---
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api"; // Usando a instância centralizada
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { ICourse } from "@/models/Course.model"; // Importando a interface do curso

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const registerSchema = z
  .object({
    // --- MODIFICAÇÃO AQUI ---
    // A validação permanece a mesma, mas o campo será populado dinamicamente.
    curso: z.string().min(1, { message: "Por favor, selecione um curso." }),
    nome: z
      .string()
      .min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
    email: z.string().email({ message: "Por favor, insira um email válido." }),
    senha: z
      .string()
      .min(8, { message: "A senha deve ter no mínimo 8 caracteres." }),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// --- MODIFICAÇÃO AQUI: Função para buscar os cursos públicos ---
const fetchPublicCourses = async (): Promise<ICourse[]> => {
  const { data } = await api.get("/api/public/courses");
  return data;
};

export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // --- MODIFICAÇÃO AQUI: useQuery para buscar os cursos ---
  const {
    data: courses,
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useQuery<ICourse[]>({
    queryKey: ["publicCourses"],
    queryFn: fetchPublicCourses,
  });

  const {
    mutate: registerUser,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const { curso, nome, email, senha } = data;
      const payload = { courseId: curso, nome, email, password: senha };
      // --- MODIFICAÇÃO AQUI: Usando a instância 'api' ---
      const { data: responseData } = await api.post(
        "/api/auth/register",
        payload
      );
      return responseData;
    },
    onSuccess: () => {
      alert(
        "Cadastro realizado com sucesso! Você será redirecionado para o login."
      );
      router.push("/login");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      curso: "",
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data);
  };

  const apiErrorMessage =
    error instanceof AxiosError ? error.response?.data?.message : null;

  return (
    <main className="flex h-screen w-full">
      {/* Esquerda */}
      <section className="w-1/2 bg-blue-900 text-white flex flex-col items-start justify-center p-10">
        <h1 className={`text-4xl font-bold mb-4 ${poppins.className}`}>
          Bem vindo!
        </h1>
        <p className="max-w-md text-left px-2">
          Vamos começar esta jornada mais organizada? Preencha com suas
          informações. Já tem uma conta?{" "}
          <Link
            href="/login"
            className="underline text-blue-200 hover:text-white"
          >
            Faça Login
          </Link>
        </p>
      </section>

      {/* Direita */}
      <section className="w-1/2 bg-white flex flex-col justify-center items-center p-10">
        <h2
          className={`text-2xl font-bold text-gray-800 mb-6 ${poppins.className}`}
        >
          Se Inscreva
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
          <div className="flex gap-2">
            <div className="w-1/2 flex flex-col">
              {/* --- MODIFICAÇÃO AQUI: Select de cursos dinâmico --- */}
              <select
                {...register("curso")}
                className="px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700"
                disabled={isLoadingCourses || !!coursesError}
              >
                <option value="">
                  {isLoadingCourses
                    ? "Carregando cursos..."
                    : coursesError
                    ? "Erro ao carregar"
                    : "Selecione seu curso"}
                </option>
                {courses?.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.nome}
                  </option>
                ))}
              </select>
              {errors.curso && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.curso.message}
                </p>
              )}
            </div>
            <div className="w-1/2 flex flex-col">
              <input
                type="text"
                placeholder="Nome"
                {...register("nome")}
                className="px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700"
              />
              {errors.nome && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.nome.message}
                </p>
              )}
            </div>
          </div>

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
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.senha && (
              <p className="text-red-500 text-xs mt-1">
                {errors.senha.message}
              </p>
            )}
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmar senha"
              {...register("confirmarSenha")}
              className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.confirmarSenha && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmarSenha.message}
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
            {isPending ? "Cadastrando..." : "Pronto"}
          </button>
        </form>
      </section>
    </main>
  );
}
