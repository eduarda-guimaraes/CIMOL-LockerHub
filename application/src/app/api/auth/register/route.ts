// application/src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { registerUser } from "@/lib/services/auth.service";
import { z } from "zod";

const registerSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Formato de email inválido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  // --- MODIFICAÇÃO AQUI: Tipando o parâmetro 'val' ---
  courseId: z.string().refine((val: string) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: "ID do curso inválido.",
  }),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Dados de entrada inválidos.",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { nome, email, password, courseId } = validation.data;
    const newUser = await registerUser({ nome, email, password, courseId });

    return NextResponse.json(
      { message: "Usuário registrado com sucesso!", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro na rota /api/auth/register:", error);

    if (error instanceof Error) {
      if (error.message.includes("email já está cadastrado")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
      }
    }

    return NextResponse.json(
      { message: "Ocorreu um erro interno no servidor." },
      { status: 500 }
    );
  }
}
