// application/src/app/(main)/layout.tsx
"use client";

import { ReactNode } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { useAuth } from "@/components/Auth/AuthContext";
// --- MODIFICAÇÃO AQUI: Importando novo ícone ---
import { LogOut, Users, Package, GraduationCap } from "lucide-react";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white flex flex-col">
          <div className="h-16 flex items-center justify-center text-xl font-bold">
            LockerHub
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/courses"
              className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
            >
              <Package size={18} />
              Cursos
            </Link>
            {/* --- MODIFICAÇÃO AQUI: Adicionando o link para Alunos --- */}
            <Link
              href="/dashboard/students"
              className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
            >
              <GraduationCap size={18} />
              Alunos
            </Link>
            <Link
              href="/dashboard/lockers"
              className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
            >
              <Package size={18} />
              Armários
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/dashboard/users"
                className="flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-700"
              >
                <Users size={18} />
                Usuários
              </Link>
            )}
          </nav>
        </aside>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm h-16 flex items-center justify-end px-8">
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm font-medium text-gray-700">
                  Olá, {user.email}
                </span>
              )}
              <button
                onClick={logout}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                aria-label="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          </header>
          <main className="flex-1 p-8 bg-gray-50">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
