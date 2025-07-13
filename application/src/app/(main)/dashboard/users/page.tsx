// application/src/app/(main)/dashboard/users/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/components/Auth/AuthContext";
import AdminProtectedRoute from "@/components/Auth/AdminProtectedRoute";
import { fetchCourses } from "@/services/course.service";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  createUserSchema,
  updateUserSchema,
  CreateUserFormData,
  UpdateUserFormData,
  PopulatedUser,
} from "@/services/user.service";
import Modal from "@/components/ui/Modal";
import { ICourse } from "@/models";

export default function UsersPage() {
  const { user: loggedInUser } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PopulatedUser | null>(null);

  const { data: users, isLoading: isLoadingUsers } = useQuery<PopulatedUser[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
  const { data: courses, isLoading: isLoadingCourses } = useQuery<ICourse[]>({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  const formSchema = editingUser ? updateUserSchema : createUserSchema;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { role: "coordinator" },
  });

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    closeModal();
  };

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: handleSuccess,
  });
  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; data: UpdateUserFormData }) =>
      updateUser(vars.id, vars.data),
    onSuccess: handleSuccess,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: handleSuccess,
  });

  const openModalForCreate = () => {
    setEditingUser(null);
    reset({
      nome: "",
      email: "",
      password: "",
      courseId: "",
      role: "coordinator",
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (user: PopulatedUser) => {
    setEditingUser(user);
    reset({
      nome: user.nome,
      email: user.email,
      password: "",
      courseId: user.courseId?._id || "",
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    reset();
  };

  const onSubmit = (data: CreateUserFormData | UpdateUserFormData) => {
    if (editingUser) {
      updateMutation.mutate({
        id: editingUser._id.toString(),
        data: data as UpdateUserFormData,
      });
    } else {
      createMutation.mutate(data as CreateUserFormData);
    }
  };

  const isLoading = isLoadingUsers || isLoadingCourses;

  return (
    <AdminProtectedRoute>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciamento de Usuários
          </h1>
          <button
            onClick={openModalForCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={18} /> Adicionar Usuário
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
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Curso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users?.map((user) => (
                  <tr key={user._id.toString()}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {user.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {user.courseId?.nome || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => openModalForEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() =>
                          deleteMutation.mutate(user._id.toString())
                        }
                        disabled={user._id.toString() === loggedInUser?.id}
                        className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
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
          title={editingUser ? "Editar Usuário" : "Novo Usuário"}
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
                form="user-form"
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
            id="user-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
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
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
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
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                placeholder={
                  editingUser ? "Deixe em branco para não alterar" : ""
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="courseId"
                className="block text-sm font-medium text-gray-700"
              >
                Curso
              </label>
              <select
                id="courseId"
                {...register("courseId")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              >
                <option value="">Selecione um curso</option>
                {courses?.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.nome}
                  </option>
                ))}
              </select>
              {errors.courseId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.courseId.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="role"
                {...register("role")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              >
                <option value="coordinator">Coordinator</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.role.message}
                </p>
              )}
            </div>
          </form>
        </Modal>
      </div>
    </AdminProtectedRoute>
  );
}
