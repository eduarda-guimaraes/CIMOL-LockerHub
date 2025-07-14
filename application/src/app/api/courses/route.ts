// application/src/app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course from "@/models/Course.model";
import { z } from "zod";

const courseSchema = z.object({
  nome: z.string().min(3, "O nome do curso é obrigatório."),
  codigo: z.string().min(2, "O código do curso é obrigatório."),
});

// GET: Listar todos os cursos
export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find({}).sort({ nome: 1 });
    return NextResponse.json(courses, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Erro ao buscar cursos." },
      { status: 500 }
    );
  }
}

// POST: Criar um novo curso
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const validation = courseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { nome, codigo } = validation.data;
    const newCourse = new Course({ nome, codigo });
    await newCourse.save();

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    // --- MODIFICAÇÃO AQUI: Removendo 'any' ---
    // Verificando se o erro é um objeto e se tem a propriedade 'code'
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "O código do curso já existe." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Erro ao criar curso." },
      { status: 500 }
    );
  }
}
