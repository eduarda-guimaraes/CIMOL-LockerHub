// application/src/app/api/lockers/[id]/route.ts
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
  // O status não é editável diretamente aqui, será gerenciado pelo aluguel
});

// PUT: Atualizar um armário
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const validation = lockerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten() },
        { status: 400 }
      );
    }

    const updatedLocker = await Locker.findByIdAndUpdate(id, validation.data, {
      new: true,
    });

    if (!updatedLocker) {
      return NextResponse.json(
        { message: "Armário não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedLocker, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar armário:", error);
    return NextResponse.json(
      { message: "Erro ao atualizar armário." },
      { status: 500 }
    );
  }
}

// DELETE: Deletar um armário
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const deletedLocker = await Locker.findByIdAndDelete(id);

    if (!deletedLocker) {
      return NextResponse.json(
        { message: "Armário não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Armário deletado com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar armário:", error);
    return NextResponse.json(
      { message: "Erro ao deletar armário." },
      { status: 500 }
    );
  }
}
