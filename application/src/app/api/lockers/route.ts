// application/src/app/api/lockers/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Locker from "@/models/Locker.model";
import { z } from "zod";

const lockerSchema = z.object({
  numero: z.string().min(1, "O número é obrigatório."),
  building: z.enum(["A", "B", "C", "D", "E"]),
  courseId: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: "ID do curso inválido.",
  }),
});

// GET: Listar todos os armários
export async function GET() {
  try {
    await connectDB();
    // Usamos .populate() para buscar os dados do curso relacionado
    const lockers = await Locker.find({})
      .populate("courseId", "nome codigo") // Seleciona apenas os campos 'nome' e 'codigo' do curso
      .sort({ numero: 1 });
    return NextResponse.json(lockers, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar armários:", error);
    return NextResponse.json(
      { message: "Erro ao buscar armários." },
      { status: 500 }
    );
  }
}

// POST: Criar um novo armário
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const validation = lockerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const newLocker = new Locker(validation.data);
    await newLocker.save();

    return NextResponse.json(newLocker, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: "O número do armário já existe." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Erro ao criar armário." },
      { status: 500 }
    );
  }
}
