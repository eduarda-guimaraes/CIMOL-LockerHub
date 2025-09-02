// application/src/services/locker.service.ts
import api from "@/lib/api";
import { ILocker, ICourse, IRental, IStudent } from "@/models";
import { z } from "zod";

// --- Schemas e Tipos para Formulários (sem alterações) ---
export const lockerFormSchema = z.object({
  numero: z.string().min(1, { message: "O número é obrigatório." }),
  building: z.enum(["A", "B", "C", "D", "E"]),
  courseId: z.string().min(1, { message: "Selecione um curso." }),
});
export type LockerFormData = z.infer<typeof lockerFormSchema>;

export const rentalFormSchema = z.object({
  studentId: z.string().min(1, { message: "Você deve selecionar um aluno." }),
  dataInicio: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "A data de início é obrigatória.",
  }),
  dataPrevista: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "A data de devolução prevista é obrigatória.",
  }),
});
export type RentalFormData = z.infer<typeof rentalFormSchema>;

// --- Tipos de Dados da API (sem alterações) ---
export type PopulatedLocker = Omit<ILocker, "courseId"> & {
  courseId: ICourse;
  activeRental?: IRental & {
    studentId: IStudent;
  };
};

export interface LockerFilters {
  status?: string;
  building?: string;
  courseId?: string;
  numero?: string;
}

// --- Funções de Serviço (CORRIGIDAS) ---

/**
 * Busca armários com base nos filtros fornecidos.
 */
export const fetchLockers = async (
  filters: LockerFilters = {}
): Promise<PopulatedLocker[]> => {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.building) params.append("building", filters.building);
  if (filters.courseId) params.append("courseId", filters.courseId);
  if (filters.numero) params.append("numero", filters.numero);

  // CORREÇÃO AQUI: Especificamos o tipo de retorno esperado no .get()
  const { data } = await api.get<PopulatedLocker[]>(
    `/api/lockers?${params.toString()}`
  );
  return data;
};

/**
 * Cria um novo armário.
 */
export const createLocker = async (data: LockerFormData): Promise<ILocker> => {
  // CORREÇÃO AQUI: Especificamos o tipo de retorno esperado no .post()
  const { data: newLocker } = await api.post<ILocker>("/api/lockers", data);
  return newLocker;
};

/**
 * Atualiza um armário existente.
 */
export const updateLocker = async (
  id: string,
  data: LockerFormData
): Promise<ILocker> => {
  // CORREÇÃO AQUI: Especificamos o tipo de retorno esperado no .put()
  const { data: updatedLocker } = await api.put<ILocker>(
    `/api/lockers/${id}`,
    data
  );
  return updatedLocker;
};

/**
 * Deleta um armário.
 */
export const deleteLocker = async (
  id: string
): Promise<{ message: string }> => {
  // CORREÇÃO AQUI: Especificamos o tipo de retorno e o retornamos
  const { data } = await api.delete<{ message: string }>(`/api/lockers/${id}`);
  return data;
};

/**
 * Cria um novo aluguel para um armário.
 */
export const createRental = async (
  lockerId: string,
  rentalData: RentalFormData
): Promise<{ message: string; rental: IRental }> => {
  const payload = {
    lockerId,
    studentId: rentalData.studentId,
    dataInicio: rentalData.dataInicio,
    dataPrevista: rentalData.dataPrevista,
  };
  // CORREÇÃO AQUI: Especificamos o tipo de retorno
  const { data } = await api.post<{ message: string; rental: IRental }>(
    "/api/rentals",
    payload
  );
  return data;
};

/**
 * Registra a devolução de um aluguel.
 */
export const returnRental = async (
  rentalId: string
): Promise<{ message: string }> => {
  // CORREÇÃO AQUI: Especificamos o tipo de retorno
  const { data } = await api.patch<{ message: string }>(
    `/api/rentals/${rentalId}`
  );
  return data;
};