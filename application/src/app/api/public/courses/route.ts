// --- ARQUIVO NOVO ---
// application/src/app/api/public/courses/route.ts

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course from "@/models/Course.model";

/**
 * Endpoint público para listar todos os cursos disponíveis.
 * Usado na página de cadastro para popular o seletor de cursos.
 * Não requer autenticação.
 */
export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find({})
      .select("_id nome") // Otimização: seleciona apenas os campos necessários
      .sort({ nome: 1 }); // Ordena por nome em ordem alfabética

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar cursos públicos:", error);
    return NextResponse.json(
      { message: "Erro ao buscar cursos." },
      { status: 500 }
    );
  }
}
