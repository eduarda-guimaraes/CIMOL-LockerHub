// application/src/app/(main)/dashboard/page.tsx
"use client";

import { useAuth } from "@/components/Auth/AuthContext";
import { useQuery } from "@tanstack/react-query";
// --- MODIFICAÇÃO AQUI ---
import api from "@/lib/api"; // Usando a instância centralizada
import { Package, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  total: number;
  available: number;
  occupied: number;
  overdue: number;
}

// --- MODIFICAÇÃO AQUI: Função movida para fora e usando 'api' ---
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/api/dashboard/stats");
  return data;
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  link,
  colorClass,
  isLoading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  link: string;
  colorClass: string;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
        <div className="p-5">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={link}
      className="block hover:shadow-lg transition-shadow duration-200"
    >
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div
              className={`flex-shrink-0 p-3 rounded-md ${colorClass} bg-opacity-20`}
            >
              <Icon className={`h-6 w-6 ${colorClass}`} aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {title}
                </dt>
                <dd className="text-3xl font-semibold text-gray-900">
                  {value}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Bem-vindo ao Dashboard, {user?.nome || user?.email}!
      </h1>
      <p className="mt-2 text-gray-600">
        Aqui está um resumo do status dos armários do seu curso.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Armários"
          value={stats?.total ?? 0}
          icon={Package}
          link="/dashboard/lockers"
          colorClass="text-blue-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Disponíveis"
          value={stats?.available ?? 0}
          icon={CheckCircle2}
          link="/dashboard/lockers"
          colorClass="text-green-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Ocupados"
          value={stats?.occupied ?? 0}
          icon={XCircle}
          link="/dashboard/lockers"
          colorClass="text-red-600"
          isLoading={isLoading}
        />
        <StatCard
          title="Em Atraso"
          value={stats?.overdue ?? 0}
          icon={AlertTriangle}
          link="/dashboard/rentals" // Link futuro para uma página de aluguéis
          colorClass="text-yellow-500"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
