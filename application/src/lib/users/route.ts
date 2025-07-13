// application/src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User.model";
import { withAdminAuth } from "@/lib/auth/withAdminAuth";
import { z } from "zod";

const createUserSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  courseId: z.string().min(1),
  role: z.enum(["admin", "coordinator"]),
});

// GET: Listar todos os usuários
const getUsersHandler = async () => {
  await connectDB();
  const users = await User.find({})
    .populate("courseId", "nome")
    .select("-password")
    .sort({ nome: 1 });
  return NextResponse.json(users);
};

// POST: Criar um novo usuário
const createUserHandler = async (req: NextRequest) => {
  await connectDB();
  const body = await req.json();
  const validation = createUserSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { errors: validation.error.flatten() },
      { status: 400 }
    );
  }

  const newUser = new User(validation.data);
  await newUser.save();
  return NextResponse.json(newUser, { status: 201 });
};

export const GET = withAdminAuth(getUsersHandler);
export const POST = withAdminAuth(createUserHandler);
