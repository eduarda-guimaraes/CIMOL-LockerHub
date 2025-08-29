// application/src/app/api/public/courses/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Course from "@/models/Course.model";

export const dynamic = "force-dynamic"; // evita cache em dev / edge

// Seed padrão (idempotente): só insere se não existir
const SEED = [
  { nome: "Informática",       codigo: "INF" },
  { nome: "Eletrônica",        codigo: "ELO" },
  { nome: "Eletrotécnica",     codigo: "ELE" },
  { nome: "Móveis",            codigo: "MOV" },
  { nome: "Mecânica",          codigo: "MEC" },
  { nome: "Design de Imóveis", codigo: "DES" },
  { nome: "Química",           codigo: "QUI" },
  { nome: "Meio Ambiente",     codigo: "MAB"  },
];

/**
 * Endpoint público para listar cursos (usado no cadastro).
 * - Faz seed idempotente para garantir a lista base.
 * - Retorna apenas _id e nome (o cadastro só precisa disso).
 */
export async function GET() {
  try {
    await connectDB();

    // Garante que os cursos existam sem duplicar
    await Promise.all(
      SEED.map((c) =>
        Course.updateOne(
          { codigo: c.codigo },
          { $setOnInsert: c },
          { upsert: true }
        )
      )
    );

    const courses = await Course.find({}, { _id: 1, nome: 1 })
      .sort({ nome: 1 })
      .lean();

    // Evita cache de resposta
    return new NextResponse(JSON.stringify(courses), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erro ao buscar cursos públicos:", error);
    return NextResponse.json(
      { message: "Erro ao buscar cursos." },
      { status: 500 }
    );
  }
}
