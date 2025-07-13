// application/src/app/(main)/dashboard/lockers/page.tsx
"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, KeyRound, Undo2 } from "lucide-react";
import { fetchCourses } from "@/services/course.service";
import { fetchStudents } from "@/services/student.service";
import {
  fetchLockers,
  createLocker,
  updateLocker,
  deleteLocker,
  createRental,
  returnRental,
  lockerFormSchema,
  LockerFormData,
  rentalFormSchema,
  RentalFormData,
  PopulatedLocker,
} from "@/services/locker.service";

export default function LockersPage() {
  const queryClient = useQueryClient();
  const [isLockerModalOpen, setIsLockerModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState<PopulatedLocker | null>(
    null
  );

  const { data: lockers, isLoading: isLoadingLockers } = useQuery({
    queryKey: ["lockers"],
    queryFn: fetchLockers,
  });
  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });

  const lockerForm = useForm<LockerFormData>({
    resolver: zodResolver(lockerFormSchema),
  });
  const rentalForm = useForm<RentalFormData>({
    resolver: zodResolver(rentalFormSchema),
  });

  const handleMutationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["lockers"] });
    setIsLockerModalOpen(false);
    setIsRentalModalOpen(false);
    setSelectedLocker(null);
  };

  const createLockerMutation = useMutation({
    mutationFn: createLocker,
    onSuccess: handleMutationSuccess,
  });
  const updateLockerMutation = useMutation({
    mutationFn: (vars: { id: string; data: LockerFormData }) =>
      updateLocker(vars.id, vars.data),
    onSuccess: handleMutationSuccess,
  });
  const deleteLockerMutation = useMutation({
    mutationFn: deleteLocker,
    onSuccess: handleMutationSuccess,
  });
  const createRentalMutation = useMutation({
    mutationFn: (vars: { lockerId: string; studentId: string }) =>
      createRental(vars.lockerId, vars.studentId),
    onSuccess: handleMutationSuccess,
  });
  const returnRentalMutation = useMutation({
    mutationFn: returnRental,
    onSuccess: handleMutationSuccess,
  });

  const openLockerModal = (locker: PopulatedLocker | null) => {
    setSelectedLocker(locker);
    if (locker) {
      lockerForm.reset({
        numero: locker.numero,
        building: locker.building,
        courseId: locker.courseId._id,
      });
    } else {
      lockerForm.reset({ numero: "", building: undefined, courseId: "" });
    }
    setIsLockerModalOpen(true);
  };

  const openRentalModal = (locker: PopulatedLocker) => {
    setSelectedLocker(locker);
    rentalForm.reset({ studentId: "" });
    setIsRentalModalOpen(true);
  };

  const onLockerSubmit = (data: LockerFormData) => {
    if (selectedLocker) {
      updateLockerMutation.mutate({ id: selectedLocker._id, data });
    } else {
      createLockerMutation.mutate(data);
    }
  };

  const onRentalSubmit = (data: RentalFormData) => {
    if (selectedLocker) {
      createRentalMutation.mutate({
        lockerId: selectedLocker._id,
        studentId: data.studentId,
      });
    }
  };

  const handleReturn = (rentalId: string) => {
    if (
      window.confirm(
        "Tem certeza que deseja registrar a devolução deste armário?"
      )
    ) {
      returnRentalMutation.mutate(rentalId);
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
          onClick={() => openLockerModal(null)}
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
                    {locker.status === "available" && (
                      <button
                        onClick={() => openRentalModal(locker)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <KeyRound size={16} /> Alugar
                      </button>
                    )}
                    {locker.status === "occupied" && locker.activeRental && (
                      <button
                        onClick={() => {
                          if (
                            locker.activeRental &&
                            typeof locker.activeRental._id === "string"
                          ) {
                            handleReturn(locker.activeRental._id);
                          }
                        }}
                        disabled={returnRentalMutation.isPending}
                        className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-900 mr-4 disabled:opacity-50"
                      >
                        <Undo2 size={16} /> Devolver
                      </button>
                    )}
                    <button
                      onClick={() => openLockerModal(locker)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteLockerMutation.mutate(locker._id)}
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

      {/* Modal de CRUD de Armário */}
      {isLockerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {selectedLocker ? "Editar Armário" : "Novo Armário"}
            </h2>
            <form
              onSubmit={lockerForm.handleSubmit(onLockerSubmit)}
              className="space-y-4"
            >
              <div>
                <label htmlFor="numero" className="block text-sm font-medium">
                  Número
                </label>
                <input
                  id="numero"
                  type="text"
                  {...lockerForm.register("numero")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {lockerForm.formState.errors.numero && (
                  <p className="text-red-500 text-xs mt-1">
                    {lockerForm.formState.errors.numero.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="building" className="block text-sm font-medium">
                  Prédio
                </label>
                <select
                  id="building"
                  {...lockerForm.register("building")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selecione um prédio</option>
                  {["A", "B", "C", "D", "E"].map((b) => (
                    <option key={b} value={b}>
                      Prédio {b}
                    </option>
                  ))}
                </select>
                {lockerForm.formState.errors.building && (
                  <p className="text-red-500 text-xs mt-1">
                    {lockerForm.formState.errors.building.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="courseId" className="block text-sm font-medium">
                  Curso
                </label>
                <select
                  id="courseId"
                  {...lockerForm.register("courseId")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selecione um curso</option>
                  {courses?.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.nome}
                    </option>
                  ))}
                </select>
                {lockerForm.formState.errors.courseId && (
                  <p className="text-red-500 text-xs mt-1">
                    {lockerForm.formState.errors.courseId.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsLockerModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    createLockerMutation.isPending ||
                    updateLockerMutation.isPending
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
                >
                  {createLockerMutation.isPending ||
                  updateLockerMutation.isPending
                    ? "Salvando..."
                    : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Aluguel */}
      {isRentalModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              Alugar Armário {selectedLocker?.numero}
            </h2>
            <form
              onSubmit={rentalForm.handleSubmit(onRentalSubmit)}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="studentId"
                  className="block text-sm font-medium"
                >
                  Aluno
                </label>
                <select
                  id="studentId"
                  {...rentalForm.register("studentId")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Selecione um aluno</option>
                  {isLoadingStudents ? (
                    <option>Carregando...</option>
                  ) : (
                    students?.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.nome}
                      </option>
                    ))
                  )}
                </select>
                {rentalForm.formState.errors.studentId && (
                  <p className="text-red-500 text-xs mt-1">
                    {rentalForm.formState.errors.studentId.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRentalModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createRentalMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
                >
                  {createRentalMutation.isPending
                    ? "Alugando..."
                    : "Confirmar Aluguel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
