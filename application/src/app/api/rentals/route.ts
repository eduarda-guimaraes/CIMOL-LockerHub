// application/src/app/api/rentals/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Locker from "@/models/Locker.model";
import Rental from "@/models/Rental.model";
import Student from "@/models/Student.model";
import mongoose from "mongoose";
import { z } from "zod";

const rentalSchema = z.object({
  lockerId: z.string().min(1, "ID do armário é obrigatório."),
  studentId: z.string().min(1, "ID do aluno é obrigatório."),
});

export async function POST(req: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();
    const body = await req.json();
    const validation = rentalSchema.safeParse(body);

    if (!validation.success) {
      await session.abortTransaction();
      return NextResponse.json(
        { errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { lockerId, studentId } = validation.data;

    // --- Validações de Negócio Dentro da Transação ---
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

    // --- Operações de Banco de Dados ---
    // 1. Atualizar o status do armário
    locker.status = "occupied";
    await locker.save({ session });

    // 2. Criar o novo registro de aluguel
    const newRental = new Rental({
      lockerId,
      studentId,
      datas: {
        inicio: new Date(),
        // Regra de negócio: aluguel válido até o final do ano letivo
        prevista: new Date(new Date().getFullYear(), 11, 31),
      },
      isActive: true,
    });
    await newRental.save({ session });

    // Se tudo deu certo, commita a transação
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

    return NextResponse.json({ message }, { status: 400 });
  } finally {
    // Sempre finaliza a sessão
    session.endSession();
  }
}
