// application/src/services/locker.service.ts
import api from "@/lib/api";
import { ILocker, ICourse, IRental, IStudent } from "@/models"; // Importe IStudent
import { z } from "zod";

// ... (schemas do Zod permanecem os mesmos) ...
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


// --- CORREÇÃO AQUI ---
// 1. Criamos um tipo para o aluguel POPULADO, onde studentId é garantidamente um IStudent
export type PopulatedRental = Omit<IRental, 'studentId'> & {
  studentId: IStudent;
};

// 2. Atualizamos PopulatedLocker para usar o novo tipo PopulatedRental
export type PopulatedLocker = Omit<ILocker, "courseId" | "activeRental"> & {
  courseId: ICourse;
  activeRental?: PopulatedRental; // Agora usa o tipo mais específico
};
// --- FIM DA CORREÇÃO ---


export const fetchLockers = async (): Promise<PopulatedLocker[]> =>
  (await api.get<PopulatedLocker[]>("/api/lockers")).data;
export const createLocker = async (data: LockerFormData) =>
  (await api.post("/api/lockers", data)).data;
export const updateLocker = async (id: string, data: LockerFormData) =>
  (await api.put(`/api/lockers/${id}`, data)).data;
export const deleteLocker = async (id: string) =>
  (await api.delete(`/api/lockers/${id}`)).data;

export const createRental = async (
  lockerId: string,
  rentalData: RentalFormData
) => {
  const payload = {
    lockerId,
    studentId: rentalData.studentId,
    dataInicio: rentalData.dataInicio,
    dataPrevista: rentalData.dataPrevista,
  };
  return (await api.post("/api/rentals", payload)).data;
};

export const returnRental = async (rentalId: string) => {
  return (await api.patch(`/api/rentals/${rentalId}`)).data;
};