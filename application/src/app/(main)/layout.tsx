// application/src/app/(main)/layout.tsx
"use client";

import { ReactNode } from "react";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { useAuth } from "@/components/Auth/AuthContext";
import { LogOut } from "lucide-react";

// --- MODIFICAÇÃO AQUI: Implementação do Layout Principal ---

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-blue-900">
                  CIMOL LockerHub
                </h1>
              </div>
              <div className="flex items-center gap-4">
                {user && (
                  <span className="text-sm font-medium text-gray-700">
                    Olá, {user.email}
                  </span>
                )}
                <button
                  onClick={logout}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label="Sair"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </nav>
        </header>

        <main>
          <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
