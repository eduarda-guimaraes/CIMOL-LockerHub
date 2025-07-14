// application/src/app/api/rentals/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Locker from "@/models/Locker.model";
import Rental from "@/models/Rental.model";
import Student from "@/models/Student.model";
import mongoose from "mongoose";
import { z } from "zod";

// --- MODIFICAÇÃO AQUI: Adicionando datas ao schema de validação ---
const rentalSchema = z.object({
  lockerId: z.string().min(1, "ID do armário é obrigatório."),
  studentId: z.string().min(1, "ID do aluno é obrigatório."),
  // As datas virão como string do formulário (ex: '2024-08-01')
  dataInicio: z.string().min(1, "A data de início é obrigatória."),
  dataPrevista: z
    .string()
    .min(1, "A data de devolução prevista é obrigatória."),
});

export async function POST(req: NextRequest) {
  await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const body = await req.json();
    const validation = rentalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    // --- MODIFICAÇÃO AQUI: Capturando as novas datas ---
    const { lockerId, studentId, dataInicio, dataPrevista } = validation.data;

    const locker = await Locker.findById(lockerId).session(session);
    if (!locker) {
      throw new Error("Armário não encontrado.");
    }
    if (locker.status !== "available") {
      throw new Error("Este armário não está disponível para aluguel.");
    }

    const student = await Student.findById(studentId).session(session);
    if (!student) {
      throw new Error("Aluno não encontrado.");
    }

    const existingRental = await Rental.findOne({
      studentId,
      isActive: true,
    }).session(session);
    if (existingRental) {
      throw new Error("Este aluno já possui um aluguel ativo.");
    }

    locker.status = "occupied";
    await locker.save({ session });

    // --- MODIFICAÇÃO AQUI: Usando as datas fornecidas para criar o aluguel ---
    const newRental = new Rental({
      lockerId,
      studentId,
      datas: {
        // Convertendo as strings para objetos Date
        inicio: new Date(dataInicio),
        prevista: new Date(dataPrevista),
      },
      isActive: true,
    });
    await newRental.save({ session });

    await session.commitTransaction();

    return NextResponse.json(
      { message: "Armário alugado com sucesso!", rental: newRental },
      { status: 201 }
    );
  } catch (error: unknown) {
    await session.abortTransaction();
    console.error("Erro na transação de aluguel:", error);

    let message = "Erro ao processar o aluguel.";
    if (error instanceof Error) {
      message = error.message;
    }

    const statusCode =
      error instanceof Error &&
      (error.message.includes("disponível") ||
        error.message.includes("aluguel ativo"))
        ? 409
        : 500;

    return NextResponse.json({ message }, { status: statusCode });
  } finally {
    session.endSession();
  }
}
