// --- ARQUIVO RESTAURADO ---
// application/src/app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User, { IUser } from "@/models/User.model";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";
import { z } from "zod";

const updateUserSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal("")),
  courseId: z.string().min(1),
  role: z.enum(["admin", "coordinator"]),
});

// PUT: Atualizar um usuário
const updateUserHandler = async (
  req: NextRequest,
  _adminUser: IUser, // Corrigido com _
  { params }: { params: { id: string } }
) => {
  await connectDB();
  const { id } = params;
  const body = await req.json();
  const validation = updateUserSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { errors: validation.error.flatten() },
      { status: 400 }
    );
  }

  const updateData = validation.data;

  if (!updateData.password) {
    delete updateData.password;
  }

  const updatedUser = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!updatedUser) {
    return NextResponse.json(
      { message: "Usuário não encontrado." },
      { status: 404 }
    );
  }
  return NextResponse.json(updatedUser);
};

// DELETE: Deletar um usuário
const deleteUserHandler = async (
  _req: NextRequest, // Corrigido com _
  adminUser: IUser,
  { params }: { params: { id: string } }
) => {
  await connectDB();
  const { id } = params;

  if (adminUser._id.toString() === id) {
    return NextResponse.json(
      { message: "Administradores não podem se auto-deletar." },
      { status: 400 }
    );
  }

  const deletedUser = await User.findByIdAndDelete(id);
  if (!deletedUser) {
    return NextResponse.json(
      { message: "Usuário não encontrado." },
      { status: 404 }
    );
  }
  return NextResponse.json({ message: "Usuário deletado com sucesso." });
};

export const PUT = withAdminAuth(updateUserHandler);
export const DELETE = withAdminAuth(deleteUserHandler);
