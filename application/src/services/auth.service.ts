// application/src/services/auth.service.ts
import api from "@/lib/api";
import { ICourse } from "@/models/Course.model";
import { z } from "zod";

export const registerSchema = z.object({
  curso: z.string().min(1),
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(8),
  confirmarSenha: z.string(),
});
export type RegisterFormData = z.infer<typeof registerSchema>;

export const fetchPublicCourses = async (): Promise<ICourse[]> => {
  const { data } = await api.get("/api/public/courses");
  return data;
};

export const registerUser = async (data: RegisterFormData) => {
  const { curso, nome, email, senha } = data;
  const payload = { courseId: curso, nome, email, password: senha };
  const { data: responseData } = await api.post("/api/auth/register", payload);
  return responseData;
};
