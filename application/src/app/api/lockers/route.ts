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

    const lockers = await Locker.aggregate([
      // Passo 1: Fazer um "join" com a coleção de aluguéis
      {
        $lookup: {
          from: "rentals", // A coleção de aluguéis
          let: { locker_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$lockerId", "$$locker_id"] },
                    { $eq: ["$isActive", true] }, // Apenas aluguéis ativos
                  ],
                },
              },
            },
          ],
          as: "activeRental", // O resultado do join
        },
      },
      // Passo 2: Desconstruir o array (haverá 0 ou 1 item)
      {
        $unwind: {
          path: "$activeRental",
          preserveNullAndEmptyArrays: true, // Mantém armários sem aluguel ativo
        },
      },
      // Passo 3: Fazer um "join" com a coleção de cursos
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      // Passo 4: Desconstruir o array de curso
      {
        $unwind: {
          path: "$courseDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Passo 5: Projetar o formato final do objeto
      {
        $project: {
          _id: 1,
          numero: 1,
          status: 1,
          building: 1,
          createdAt: 1,
          updatedAt: 1,
          courseId: "$courseDetails", // Substitui o ID pelo objeto populado
          activeRental: 1, // Inclui o objeto de aluguel ativo
        },
      },
      // Passo 6: Ordenar
      { $sort: { numero: 1 } },
    ]);

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
