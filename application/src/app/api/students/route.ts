// application/src/app/api/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Student from "@/models/Student.model";
import { withAuth } from "@/lib/auth/withAuth";
import { z } from "zod";

const studentSchema = z.object({
  nome: z.string().min(3, "O nome é obrigatório."),
  matricula: z.string().min(1, "A matrícula é obrigatória."),
  course: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: "ID do curso inválido.",
  }),
  email: z
    .string()
    .email("Formato de email inválido.")
    .optional()
    .or(z.literal("")),
  telefone: z.string().optional(),
});

const getStudentsHandler = async () => {
  try {
    await connectDB();
    const students = await Student.find({})
      .populate("course", "nome codigo")
      .sort({ nome: 1 });
    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    return NextResponse.json(
      { message: "Erro ao buscar alunos." },
      { status: 500 }
    );
  }
};

const createStudentHandler = async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();
    const validation = studentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const newStudent = new Student(validation.data);
    await newStudent.save();

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error: unknown) {
    // --- MODIFICAÇÃO AQUI: de 'any' para 'unknown' ---
    // --- MODIFICAÇÃO AQUI: Verificação de tipo para o erro ---
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000 &&
      "keyPattern" in error &&
      typeof error.keyPattern === "object" &&
      error.keyPattern !== null
    ) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { message: `Já existe um aluno com este ${field}.` },
        { status: 409 }
      );
    }
    console.error("Erro ao criar aluno:", error);
    return NextResponse.json(
      { message: "Erro ao criar aluno." },
      { status: 500 }
    );
  }
};

export const GET = withAuth(getStudentsHandler);
export const POST = withAuth(createStudentHandler);
