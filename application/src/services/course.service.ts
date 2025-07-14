// application/src/services/course.service.ts

import api from "@/lib/api";
import { ICourse } from "@/models/Course.model";
import { z } from "zod";

// --- MODIFICAÇÃO AQUI: Exportando o schema e o tipo separadamente ---
export const courseFormSchema = z.object({
  nome: z.string().min(3),
  codigo: z.string().min(2),
});
export type CourseFormData = z.infer<typeof courseFormSchema>;

/**
 * Busca todos os cursos.
 * @returns Uma promessa que resolve para um array de ICourse.
 */
export const fetchCourses = async (): Promise<ICourse[]> => {
  const { data } = await api.get("/api/courses");
  return data;
};

/**
 * Cria um novo curso.
 * @param courseData - Os dados do curso a ser criado.
 * @returns Uma promessa que resolve para o novo ICourse.
 */
export const createCourse = async (
  courseData: CourseFormData
): Promise<ICourse> => {
  const { data } = await api.post("/api/courses", courseData);
  return data;
};

/**
 * Atualiza um curso existente.
 * @param id - O ID do curso a ser atualizado.
 * @param courseData - Os novos dados do curso.
 * @returns Uma promessa que resolve para o ICourse atualizado.
 */
export const updateCourse = async (
  id: string,
  courseData: CourseFormData
): Promise<ICourse> => {
  const { data } = await api.put(`/api/courses/${id}`, courseData);
  return data;
};

/**
 * Deleta um curso.
 * @param id - O ID do curso a ser deletado.
 */
export const deleteCourse = async (id: string): Promise<void> => {
  await api.delete(`/api/courses/${id}`);
};
