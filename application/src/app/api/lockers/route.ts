// application/src/app/api/lockers/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Locker from "@/models/Locker.model";
import mongoose from "mongoose"; // Importar mongoose para validar ObjectId
import { z } from "zod";

const lockerSchema = z.object({
  numero: z.string().min(1, "O número é obrigatório."),
  building: z.enum(["A", "B", "C", "D", "E"]),
  courseId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "ID do curso inválido.",
  }),
});

// GET: Listar todos os armários com suporte a filtros
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Extrai os parâmetros de filtro da URL
    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const building = searchParams.get("building");
    const courseId = searchParams.get("courseId");
    const numero = searchParams.get("numero");

    // Constrói o objeto de filtro para a query do MongoDB
    const matchStage: any = {};
    if (status) matchStage.status = status;
    if (building) matchStage.building = building;
    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
      matchStage.courseId = new mongoose.Types.ObjectId(courseId);
    }
    if (numero) matchStage.numero = { $regex: numero, $options: "i" }; // Busca case-insensitive

    const lockers = await Locker.aggregate([
      // Adicionamos o estágio de $match no início do pipeline
      { $match: matchStage },
      {
        $lookup: {
          from: "rentals",
          let: { locker_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$lockerId", "$$locker_id"] },
                    { $eq: ["$isActive", true] },
                  ],
                },
              },
            },
          ],
          as: "activeRental",
        },
      },
      {
        $unwind: {
          path: "$activeRental",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      {
        $unwind: {
          path: "$courseDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          numero: 1,
          status: 1,
          building: 1,
          createdAt: 1,
          updatedAt: 1,
          courseId: "$courseDetails",
          activeRental: 1,
        },
      },
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