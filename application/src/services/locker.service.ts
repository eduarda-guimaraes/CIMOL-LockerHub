// application/src/services/locker.service.ts
import api from "@/lib/api";
// --- MODIFICAÇÃO AQUI: Importação corrigida para usar o barrel file ---
import { ILocker, ICourse, IRental } from "@/models";
import { z } from "zod";

export const lockerFormSchema = z.object({
  numero: z.string().min(1, { message: "O número é obrigatório." }),
  building: z.enum(["A", "B", "C", "D", "E"]),
  courseId: z.string().min(1, { message: "Selecione um curso." }),
});
export type LockerFormData = z.infer<typeof lockerFormSchema>;

export const rentalFormSchema = z.object({
  studentId: z.string().min(1, { message: "Você deve selecionar um aluno." }),
});
export type RentalFormData = z.infer<typeof rentalFormSchema>;

export type PopulatedLocker = Omit<ILocker, "courseId"> & {
  courseId: ICourse;
  activeRental?: IRental;
};

export const fetchLockers = async (): Promise<PopulatedLocker[]> =>
  (await api.get("/api/lockers")).data;
export const createLocker = async (data: LockerFormData) =>
  (await api.post("/api/lockers", data)).data;
export const updateLocker = async (id: string, data: LockerFormData) =>
  (await api.put(`/api/lockers/${id}`, data)).data;
export const deleteLocker = async (id: string) =>
  (await api.delete(`/api/lockers/${id}`)).data;
export const createRental = async (lockerId: string, studentId: string) =>
  (await api.post("/api/rentals", { lockerId, studentId })).data;
export const returnRental = async (rentalId: string) =>
  (await api.patch(`/api/rentals/${rentalId}/return`)).data;
