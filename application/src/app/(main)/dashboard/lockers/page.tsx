// application/src/app/(main)/dashboard/lockers/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ILocker } from "@/models/Locker.model";
import { ICourse } from "@/models/Course.model";
import { Plus, Edit, Trash2 } from "lucide-react";

// --- Tipos e Schemas ---
const lockerFormSchema = z.object({
  numero: z.string().min(1, { message: "O número é obrigatório." }),
  building: z.enum(["A", "B", "C", "D", "E"], {
    message: "Por favor, selecione um prédio válido.",
  }),

  courseId: z.string().min(1, { message: "Selecione um curso." }),
});
type LockerFormData = z.infer<typeof lockerFormSchema>;

type PopulatedLocker = Omit<ILocker, "courseId"> & {
  courseId: ICourse;
};

// --- API Service Functions ---
const fetchLockers = async (): Promise<PopulatedLocker[]> => {
  const { data } = await axios.get("/api/lockers");
  return data;
};
const fetchCourses = async (): Promise<ICourse[]> => {
  const { data } = await axios.get("/api/courses");
  return data;
};
const createLocker = async (lockerData: LockerFormData) =>
  axios.post("/api/lockers", lockerData);
const updateLocker = async ({
  id,
  lockerData,
}: {
  id: string;
  lockerData: LockerFormData;
}) => axios.put(`/api/lockers/${id}`, lockerData);
const deleteLocker = async (id: string) => axios.delete(`/api/lockers/${id}`);

// --- Componente Principal ---
export default function LockersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocker, setEditingLocker] = useState<PopulatedLocker | null>(
    null
  );

  // Duas queries: uma para armários, outra para cursos (para o <select>)
  const { data: lockers, isLoading: isLoadingLockers } = useQuery<
    PopulatedLocker[]
  >({ queryKey: ["lockers"], queryFn: fetchLockers });
  const { data: courses, isLoading: isLoadingCourses } = useQuery<ICourse[]>({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LockerFormData>({ resolver: zodResolver(lockerFormSchema) });

  const handleMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["lockers"] });
    closeModal();
  };

  const createMutation = useMutation({
    mutationFn: createLocker,
    onSuccess: handleMutationSuccess,
  });
  const updateMutation = useMutation({
    mutationFn: updateLocker,
    onSuccess: handleMutationSuccess,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteLocker,
    onSuccess: handleMutationSuccess,
  });

  const openModalForCreate = () => {
    setEditingLocker(null);
    reset({ numero: "", building: "A", courseId: "" });
    setIsModalOpen(true);
  };

  const openModalForEdit = (locker: PopulatedLocker) => {
    setEditingLocker(locker);
    reset({
      numero: locker.numero,
      building: locker.building,
      courseId: locker.courseId._id,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLocker(null);
    reset();
  };

  const onSubmit = (data: LockerFormData) => {
    if (editingLocker) {
      updateMutation.mutate({ id: editingLocker._id, lockerData: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = isLoadingLockers || isLoadingCourses;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gerenciamento de Armários
        </h1>
        <button
          onClick={openModalForCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={18} /> Adicionar Armário
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
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Prédio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Curso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lockers?.map((locker) => (
                <tr key={locker._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {locker.numero}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {locker.building}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {locker.courseId?.nome || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        locker.status === "available"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {locker.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => openModalForEdit(locker)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(locker._id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingLocker ? "Editar Armário" : "Novo Armário"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="numero" className="block text-sm font-medium">
                  Número
                </label>
                <input
                  id="numero"
                  type="text"
                  {...register("numero")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {errors.numero && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.numero.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="building" className="block text-sm font-medium">
                  Prédio
                </label>
                <select
                  id="building"
                  {...register("building")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {["A", "B", "C", "D", "E"].map((b) => (
                    <option key={b} value={b}>
                      Prédio {b}
                    </option>
                  ))}
                </select>
                {errors.building && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.building.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="courseId" className="block text-sm font-medium">
                  Curso
                </label>
                <select
                  id="courseId"
                  {...register("courseId")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
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
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 rounded-md"
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
