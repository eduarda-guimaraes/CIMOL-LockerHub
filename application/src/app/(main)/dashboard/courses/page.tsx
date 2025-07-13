// application/src/app/(main)/dashboard/courses/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ICourse } from "@/models/Course.model";
import { Plus, Edit, Trash2 } from "lucide-react";

// --- MODIFICAÇÃO AQUI: Importando as funções do serviço ---
import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "@/services/course.service";

// O schema de validação permanece aqui, pois está diretamente ligado ao formulário deste componente.
const courseFormSchema = z.object({
  nome: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  codigo: z
    .string()
    .min(2, { message: "O código deve ter pelo menos 2 caracteres." }),
});
type CourseFormData = z.infer<typeof courseFormSchema>;

// --- MODIFICAÇÃO AQUI: As funções de serviço da API foram removidas daqui ---

// --- Componente Principal ---
export default function CoursesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ICourse | null>(null);

  const {
    data: courses,
    isLoading,
    error,
  } = useQuery<ICourse[], AxiosError>({
    queryKey: ["courses"],
    queryFn: fetchCourses, // Usando a função importada
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
  });

  const handleMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["courses"] });
    closeModal();
  };

  const createMutation = useMutation({
    mutationFn: createCourse, // Usando a função importada
    onSuccess: handleMutationSuccess,
  });
  const updateMutation = useMutation({
    // --- MODIFICAÇÃO AQUI: useMutation espera uma função com um único argumento ---
    // Adaptamos a chamada para corresponder à assinatura do serviço.
    mutationFn: (variables: { id: string; courseData: CourseFormData }) =>
      updateCourse(variables.id, variables.courseData),
    onSuccess: handleMutationSuccess,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCourse, // Usando a função importada
    onSuccess: handleMutationSuccess,
  });

  const openModalForCreate = () => {
    setEditingCourse(null);
    reset({ nome: "", codigo: "" });
    setIsModalOpen(true);
  };

  const openModalForEdit = (course: ICourse) => {
    setEditingCourse(course);
    reset({ nome: course.nome, codigo: course.codigo });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    reset();
  };

  const onSubmit = (data: CourseFormData) => {
    if (editingCourse) {
      // Passamos os dados como um único objeto para a mutação
      updateMutation.mutate({ id: editingCourse._id, courseData: data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <div>Carregando cursos...</div>;
  if (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return (
        <div>
          Sessão expirada ou sem permissão. Por favor, faça login novamente.
        </div>
      );
    }
    return <div>Erro ao carregar cursos: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gerenciamento de Cursos
        </h1>
        <button
          onClick={openModalForCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={18} />
          Adicionar Curso
        </button>
      </div>

      {/* Tabela de Cursos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses?.map((course) => (
              <tr key={course._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {course.nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {course.codigo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openModalForEdit(course)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(course._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        // --- MODIFICAÇÃO AQUI: Removendo o fundo preto do overlay ---
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {editingCourse ? "Editar Curso" : "Novo Curso"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                {/* --- MODIFICAÇÃO AQUI: Adicionando classe de cor na label --- */}
                <label
                  htmlFor="nome"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nome do Curso
                </label>
                <input
                  id="nome"
                  type="text"
                  {...register("nome")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                {errors.nome && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.nome.message}
                  </p>
                )}
              </div>
              <div>
                {/* --- MODIFICAÇÃO AQUI: Adicionando classe de cor na label --- */}
                <label
                  htmlFor="codigo"
                  className="block text-sm font-medium text-gray-700"
                >
                  Código do Curso
                </label>
                <input
                  id="codigo"
                  type="text"
                  {...register("codigo")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
                {errors.codigo && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.codigo.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Salvando..."
                    : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}