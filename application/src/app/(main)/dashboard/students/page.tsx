// application/src/app/(main)/dashboard/students/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2 } from "lucide-react";
import { AxiosError } from "axios";
import { fetchCourses } from "@/services/course.service";
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  studentFormSchema,
  StudentFormData,
  PopulatedStudent,
} from "@/services/student.service";
// --- MODIFICAÇÃO AQUI: Importando o Modal ---
import Modal from "@/components/ui/Modal";
import { ICourse } from "@/models";

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<PopulatedStudent | null>(
    null
  );

  const { data: students, isLoading: isLoadingStudents } = useQuery<
    PopulatedStudent[]
  >({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });
  const { data: courses, isLoading: isLoadingCourses } = useQuery<ICourse[]>({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
  });

  const handleMutationError = (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 409) {
      const message = error.response.data.message || "Valor duplicado.";
      if (message.includes("matricula")) {
        setError("matricula", { type: "manual", message });
      } else if (message.includes("email")) {
        setError("email", { type: "manual", message });
      }
    }
  };

  const handleMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["students"] });
    setIsModalOpen(false);
  };

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  });
  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; data: StudentFormData }) =>
      updateStudent(vars.id, vars.data),
    onSuccess: handleMutationSuccess,
    onError: handleMutationError,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: handleMutationSuccess,
  });

  const openModalForCreate = () => {
    setEditingStudent(null);
    reset({ nome: "", matricula: "", course: "", email: "", telefone: "" });
    setIsModalOpen(true);
  };

  const openModalForEdit = (student: PopulatedStudent) => {
    setEditingStudent(student);
    reset({
      nome: student.nome,
      matricula: student.matricula,
      course: student.course._id,
      email: student.email || "",
      telefone: student.telefone || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    reset();
  };

  const onSubmit = (data: StudentFormData) => {
    if (editingStudent) {
      updateMutation.mutate({ id: editingStudent._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = isLoadingStudents || isLoadingCourses;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gerenciamento de Alunos
        </h1>
        <button
          onClick={openModalForCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={18} /> Adicionar Aluno
        </button>
      </div>

      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Matrícula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students?.map((student) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                    {student.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {student.matricula}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {student.course?.nome || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {student.email || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm ">
                    <button
                      onClick={() => openModalForEdit(student)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(student._id)}
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
      )}

      {/* --- MODIFICAÇÃO AQUI: Usando o componente Modal --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingStudent ? "Editar Aluno" : "Novo Aluno"}
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="student-form"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Salvando..."
                : "Salvar"}
            </button>
          </>
        }
      >
        <form
          id="student-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700"
              >
                Nome
              </label>
              <input
                id="nome"
                type="text"
                {...register("nome")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              />
              {errors.nome && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.nome.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="matricula"
                className="block text-sm font-medium text-gray-700"
              >
                Matrícula
              </label>
              <input
                id="matricula"
                type="text"
                {...register("matricula")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              />
              {errors.matricula && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.matricula.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="course"
              className="block text-sm font-medium text-gray-700"
            >
              Curso
            </label>
            <select
              id="course"
              {...register("course")}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            >
              <option value="">Selecione um curso</option>
              {courses?.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.nome}
                </option>
              ))}
            </select>
            {errors.course && (
              <p className="text-red-500 text-xs mt-1">
                {errors.course.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email (Opcional)
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="telefone"
                className="block text-sm font-medium text-gray-700"
              >
                Telefone (Opcional)
              </label>
              <input
                id="telefone"
                type="text"
                {...register("telefone")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              />
              {errors.telefone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.telefone.message}
                </p>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
