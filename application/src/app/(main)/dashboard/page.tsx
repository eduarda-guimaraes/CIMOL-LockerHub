// application/src/app/(main)/dashboard/page.tsx
"use client";

import { useAuth } from "@/components/Auth/AuthContext";

// --- MODIFICAÇÃO AQUI: Implementação da página de Dashboard ---

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Bem-vindo ao Dashboard, {user?.email}!
      </h1>
      <p className="mt-2 text-gray-600">
        Aqui você poderá gerenciar os armários e aluguéis do seu curso.
      </p>

      {/* Placeholders para os cards de estatísticas futuras */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Armários
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">...</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Disponíveis
                  </dt>
                  <dd className="text-3xl font-semibold text-green-600">...</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ocupados
                  </dt>
                  <dd className="text-3xl font-semibold text-red-600">...</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Em Atraso
                  </dt>
                  <dd className="text-3xl font-semibold text-yellow-500">
                    ...
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
