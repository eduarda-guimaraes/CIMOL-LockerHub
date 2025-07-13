// application/src/app/api/rentals/[rentalId]/return/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Locker from "@/models/Locker.model";
import Rental from "@/models/Rental.model";
import mongoose from "mongoose";

export async function PATCH(
  req: Request,
  { params }: { params: { rentalId: string } }
) {
  const { rentalId } = params;
  if (!rentalId) {
    return NextResponse.json(
      { message: "ID do aluguel é obrigatório." },
      { status: 400 }
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    const rental = await Rental.findById(rentalId).session(session);
    if (!rental) {
      throw new Error("Registro de aluguel não encontrado.");
    }
    if (!rental.isActive) {
      throw new Error("Este aluguel já foi encerrado.");
    }

    const locker = await Locker.findById(rental.lockerId).session(session);
    if (!locker) {
      // Isso indica um estado inconsistente, mas tratamos por segurança
      throw new Error("Armário associado ao aluguel não foi encontrado.");
    }

    // Atualizar o aluguel
    rental.isActive = false;
    rental.datas.real = new Date();
    await rental.save({ session });

    // Atualizar o armário
    locker.status = "available";
    await locker.save({ session });

    await session.commitTransaction();
    return NextResponse.json({ message: "Devolução realizada com sucesso!" });
  } catch (error: unknown) {
    await session.abortTransaction();
    console.error("Erro na transação de devolução:", error);

    let message = "Erro ao processar a devolução.";
    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ message }, { status: 400 });
  } finally {
    session.endSession();
  }
}
