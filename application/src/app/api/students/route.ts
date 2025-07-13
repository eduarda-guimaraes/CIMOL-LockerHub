// application/src/app/api/students/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Student from "@/models/Student.model";

// GET: Listar todos os alunos
export async function GET() {
  try {
    await connectDB();
    const students = await Student.find({}).sort({ nome: 1 });
    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    return NextResponse.json(
      { message: "Erro ao buscar alunos." },
      { status: 500 }
    );
  }
}
