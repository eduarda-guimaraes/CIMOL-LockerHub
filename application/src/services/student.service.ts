// application/src/services/student.service.ts
import api from "@/lib/api";
import { IStudent } from "@/models/Student.model";
import { ICourse } from "@/models/Course.model";
import { z } from "zod";

export const studentFormSchema = z.object({
  nome: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  matricula: z.string().min(1, { message: "A matrícula é obrigatória." }),
  course: z.string().min(1, { message: "Selecione um curso." }),
  email: z
    .string()
    .email({ message: "Insira um email válido." })
    .optional()
    .or(z.literal("")),
  telefone: z.string().optional(),
});
export type StudentFormData = z.infer<typeof studentFormSchema>;

export type PopulatedStudent = Omit<IStudent, "course"> & {
  course: ICourse;
};

export const fetchStudents = async (): Promise<PopulatedStudent[]> =>
  (await api.get("/api/students")).data;
export const createStudent = async (data: StudentFormData) =>
  (await api.post("/api/students", data)).data;
export const updateStudent = async (id: string, data: StudentFormData) =>
  (await api.put(`/api/students/${id}`, data)).data;
export const deleteStudent = async (id: string) =>
  (await api.delete(`/api/students/${id}`)).data;
