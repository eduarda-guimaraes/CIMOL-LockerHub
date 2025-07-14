// application/src/services/locker.service.ts
import api from "@/lib/api";
import { ILocker, ICourse, IRental } from "@/models";
import { z } from "zod";

export const lockerFormSchema = z.object({
  numero: z.string().min(1, { message: "O número é obrigatório." }),
  building: z.enum(["A", "B", "C", "D", "E"]),
  courseId: z.string().min(1, { message: "Selecione um curso." }),
});
export type LockerFormData = z.infer<typeof lockerFormSchema>;

// --- MODIFICAÇÃO AQUI: Adicionando os campos de data ao schema e tipo do formulário de aluguel ---
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

// --- MODIFICAÇÃO AQUI: Atualizando a assinatura e o corpo da função createRental ---
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
