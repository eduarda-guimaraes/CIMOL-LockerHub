// application/src/services/user.service.ts
import api from "@/lib/api";
// --- MODIFICAÇÃO AQUI: Importação corrigida para usar o barrel file ---
import { IUser, ICourse } from "@/models";
import { z } from "zod";

const baseUserSchema = {
  nome: z.string().min(3, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  courseId: z.string().min(1, "Selecione um curso"),
  role: z.enum(["admin", "coordinator"]),
};
export const createUserSchema = z.object({
  ...baseUserSchema,
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});
export const updateUserSchema = z.object({
  ...baseUserSchema,
  password: z.string().optional().or(z.literal("")),
});
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export type PopulatedUser = Omit<IUser, "courseId"> & {
  courseId: ICourse;
};

export const fetchUsers = async (): Promise<PopulatedUser[]> =>
  (await api.get("/api/users")).data;
export const createUser = async (data: CreateUserFormData) =>
  (await api.post("/api/users", data)).data;
export const updateUser = async (id: string, data: UpdateUserFormData) =>
  (await api.put(`/api/users/${id}`, data)).data;
export const deleteUser = async (id: string) =>
  (await api.delete(`/api/users/${id}`)).data;
