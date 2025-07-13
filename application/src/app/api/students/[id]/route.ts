// application/src/app/api/students/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Student from "@/models/Student.model";
import { withAuth } from "@/lib/auth/withAuth";
import { z } from "zod";
import { IUser } from "@/models/User.model"; // Importar IUser para tipagem

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

// --- MODIFICAÇÃO AQUI: Assinatura da função corrigida ---
const updateStudentHandler = async (
  req: NextRequest,
  user: IUser, // O segundo argumento é o usuário
  { params }: { params: { id: string } } // O terceiro é o contexto com os params
) => {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const validation = studentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      validation.data,
      {
        new: true,
      }
    );

    if (!updatedStudent) {
      return NextResponse.json(
        { message: "Aluno não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedStudent, { status: 200 });
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
    console.error("Erro ao atualizar aluno:", error);
    return NextResponse.json(
      { message: "Erro ao atualizar aluno." },
      { status: 500 }
    );
  }
};

// --- MODIFICAÇÃO AQUI: Assinatura da função corrigida ---
const deleteStudentHandler = async (
  req: NextRequest,
  user: IUser, // O segundo argumento é o usuário
  { params }: { params: { id: string } } // O terceiro é o contexto com os params
) => {
  try {
    await connectDB();
    const { id } = params;

    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return NextResponse.json(
        { message: "Aluno não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Aluno deletado com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar aluno:", error);
    return NextResponse.json(
      { message: "Erro ao deletar aluno." },
      { status: 500 }
    );
  }
};

export const PUT = withAuth(updateStudentHandler);
export const DELETE = withAuth(deleteStudentHandler);
