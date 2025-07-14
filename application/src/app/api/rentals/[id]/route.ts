// application/src/app/api/rentals/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Locker from "@/models/Locker.model";
import Rental from "@/models/Rental.model";
import mongoose from "mongoose";
import { withAuth } from "@/lib/auth/withAuth";
import { IUser } from "@/models/User.model";

// --- MODIFICAÇÃO AQUI: A solução definitiva e explícita ---
// O handler recebe o 'context' como terceiro argumento, vindo do HOC 'withAuth'.
const returnRentalHandler = async (
  _req: NextRequest,
  _user: IUser,
  context: { params: { id: string } }
) => {
  // Desestruturamos 'params' do 'context' e então 'id' de 'params'.
  // Esta é a forma mais segura e recomendada pela documentação.
  const { id: rentalId } = context.params;

  if (!rentalId) {
    return NextResponse.json(
      { message: "ID do aluguel é obrigatório." },
      { status: 400 }
    );
  }

  await connectDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const rental = await Rental.findById(rentalId).session(session);
    if (!rental) {
      throw new Error("Registro de aluguel não encontrado.");
    }
    if (!rental.isActive) {
      throw new Error("Este aluguel já foi encerrado.");
    }

    const locker = await Locker.findById(rental.lockerId).session(session);
    if (!locker) {
      console.warn(
        `Armário ${rental.lockerId} não encontrado durante a devolução. Marcando aluguel como inativo mesmo assim.`
      );
    } else {
      locker.status = "available";
      await locker.save({ session });
    }

    rental.isActive = false;
    rental.datas.real = new Date();
    await rental.save({ session });

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
};

export const PATCH = withAuth(returnRentalHandler);
