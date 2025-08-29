"use client";

import Link from "next/link";
import { useAuth } from "@/components/Auth/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  User2,
  Filter,
} from "lucide-react";
import { useMemo } from "react";

/** =======================
 *  Tipos
 * ======================= */
type Status = "available" | "occupied" | "overdue";

interface DashboardStats {
  total: number;
  available: number;
  occupied: number;
  overdue: number;
}

interface Locker {
  _id: string;
  code: string; // ex: "C-01"
  status: Status;
  occupantName?: string | null;
}

interface OverdueRental {
  _id: string;
  lockerCode: string; // ex: "C-23"
  studentName: string; // ex: "Santiago"
}

/** =======================
 *  Fetchers
 * ======================= */
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/api/dashboard/stats");
  return data;
};

const fetchOverdue = async (): Promise<OverdueRental[]> => {
  const { data } = await api.get("/api/rentals/overdue", { params: { limit: 10 } });
  return data;
};

const fetchLockers = async (): Promise<Locker[]> => {
  const { data } = await api.get("/api/lockers", { params: { view: "grid" } });
  return data;
};

/** =======================
 *  Helpers de UI
 * ======================= */
const statusStyles: Record<
  Status,
  { chip: string; tile: string; ring: string; label: string }
> = {
  available: {
    chip: "bg-green-100 text-green-700",
    tile:
      "bg-green-50 hover:bg-green-100 border-green-200",
    ring: "ring-green-200",
    label: "Desocupado",
  },
  occupied: {
    chip: "bg-blue-100 text-blue-700",
    tile:
      "bg-blue-50 hover:bg-blue-100 border-blue-200",
    ring: "ring-blue-200",
    label: "Ocupado",
  },
  overdue: {
    chip: "bg-red-100 text-red-700",
    tile:
      "bg-red-50 hover:bg-red-100 border-red-200",
    ring: "ring-red-200",
    label: "Atrasado",
  },
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
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-10 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <Link href={link} className="block hover:shadow-lg transition-shadow duration-200">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-md bg-opacity-20 ${colorClass.replace("text", "bg")}`} >
              <Icon className={`h-6 w-6 ${colorClass}`} aria-hidden="true" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd className="text-3xl font-semibold text-gray-900">{value}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

/** Cartão pequeno usado na faixa de atrasados (scroll) */
const OverdueMiniCard = ({ item }: { item: OverdueRental }) => (
  <Link
    href={`/dashboard/rentals/${item._id}`}
    className="min-w-[140px] rounded-lg border border-red-200 bg-white shadow-sm hover:shadow transition p-3"
  >
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span className="font-medium">{item.lockerCode}</span>
      <span className="inline-flex items-center gap-1 text-red-600">
        <AlertTriangle className="h-4 w-4" />
        Atraso
      </span>
    </div>
    <div className="mt-3 flex items-center gap-2">
      <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center">
        <User2 className="h-4 w-4 text-gray-600" />
      </div>
      <div className="text-sm font-medium text-gray-800 truncate">{item.studentName}</div>
    </div>
  </Link>
);

/** Tile de armário na grade */
const LockerTile = ({ locker }: { locker: Locker }) => {
  const s = statusStyles[locker.status];
  return (
    <button
      className={`group relative flex flex-col justify-between rounded-xl border ${s.tile} p-3 shadow-sm ring-1 ${s.ring} transition focus:outline-none focus:ring-2`}
      title={`${locker.code} • ${s.label}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-600">{locker.code}</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${s.chip}`}>
          {s.label}
        </span>
      </div>

      <div className="mt-3 h-12 rounded-md border border-white/60 bg-white/70 backdrop-blur-sm group-hover:border-white" />

      {locker.occupantName ? (
        <div className="mt-3 text-[11px] text-gray-500 truncate">
          <span className="font-medium text-gray-700">Aluno:</span> {locker.occupantName}
        </div>
      ) : (
        <div className="mt-3 text-[11px] text-gray-400 italic">Sem ocupante</div>
      )}
    </button>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();

  const {
    data: stats,
    isLoading: loadingStats,
  } = useQuery<DashboardStats>({ queryKey: ["dashboardStats"], queryFn: fetchDashboardStats });

  const {
    data: overdue,
    isLoading: loadingOverdue,
    isError: errorOverdue,
  } = useQuery<OverdueRental[]>({ queryKey: ["overdueRentals"], queryFn: fetchOverdue });

  const {
    data: lockers,
    isLoading: loadingLockers,
    isError: errorLockers,
  } = useQuery<Locker[]>({ queryKey: ["lockersGrid"], queryFn: fetchLockers });

  /** Fallbacks (para não quebrar o layout se os endpoints ainda não existirem) */
  const overdueSafe = useMemo<OverdueRental[]>(
    () =>
      !loadingOverdue && (errorOverdue || !overdue || overdue.length === 0)
        ? [
            { _id: "ex1", lockerCode: "C-21", studentName: "Santiago" },
            { _id: "ex2", lockerCode: "C-05", studentName: "Larissa" },
            { _id: "ex3", lockerCode: "C-33", studentName: "João Pedro" },
          ]
        : overdue || [],
    [loadingOverdue, errorOverdue, overdue]
  );

  const lockersSafe = useMemo<Locker[]>(
    () =>
      !loadingLockers && (errorLockers || !lockers || lockers.length === 0)
        ? [
            { _id: "l1", code: "C-01", status: "occupied", occupantName: "Beatriz" },
            { _id: "l2", code: "C-02", status: "occupied", occupantName: "Gustavo" },
            { _id: "l3", code: "C-03", status: "available" },
            { _id: "l4", code: "C-04", status: "occupied", occupantName: "Felipe" },
            { _id: "l5", code: "C-05", status: "overdue", occupantName: "Larissa" },
            { _id: "l6", code: "C-06", status: "occupied", occupantName: "Vitor" },
            { _id: "l7", code: "C-07", status: "available" },
            { _id: "l8", code: "C-08", status: "occupied", occupantName: "Sarah" },
            { _id: "l9", code: "C-09", status: "occupied", occupantName: "Diego" },
            { _id: "l10", code: "C-10", status: "available" },
          ]
        : lockers || [],
    [loadingLockers, errorLockers, lockers]
  );

  return (
    <div className="space-y-8">
      {/* Cabeçalho — Bem-vindo */}
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-full bg-gray-200 flex items-center justify-center ring-1 ring-gray-300">
          <User2 className="h-6 w-6 text-gray-600" />
        </div>
        <div>
          <div className="text-sm text-gray-600">Bem-vindo, Coordenador (a)</div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {user?.nome || user?.email}
          </h1>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Armários"
          value={stats?.total ?? 0}
          icon={Package}
          link="/dashboard/lockers"
          colorClass="text-blue-600"
          isLoading={loadingStats}
        />
        <StatCard
          title="Disponíveis"
          value={stats?.available ?? 0}
          icon={CheckCircle2}
          link="/dashboard/lockers?status=available"
          colorClass="text-green-600"
          isLoading={loadingStats}
        />
        <StatCard
          title="Ocupados"
          value={stats?.occupied ?? 0}
          icon={XCircle}
          link="/dashboard/lockers?status=occupied"
          colorClass="text-blue-600"
          isLoading={loadingStats}
        />
        <StatCard
          title="Em Atraso"
          value={stats?.overdue ?? 0}
          icon={AlertTriangle}
          link="/dashboard/rentals?status=overdue"
          colorClass="text-red-600"
          isLoading={loadingStats}
        />
      </div>

      {/* Faixa de atrasados (estilo painel rosado do Figma) */}
      <section className="rounded-xl border border-red-100 bg-red-50/70 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-red-700">Atrasados</h2>
          <Link
            href="/dashboard/rentals?status=overdue"
            className="text-xs font-medium text-red-700 hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {loadingOverdue ? (
          <div className="flex gap-4 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[140px] h-[88px] rounded-lg bg-white shadow-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {overdueSafe.map((o) => (
              <OverdueMiniCard key={o._id} item={o} />
            ))}
          </div>
        )}
      </section>

      {/* Card de Armários com legenda e grade */}
      <section className="rounded-xl border bg-white shadow">
        {/* Header do card */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900">Armários</h2>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              <Filter className="h-4 w-4" />
              <span>Filtrar (em breve)</span>
            </div>
          </div>
          {/* Legenda */}
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-gray-600">Desocupado</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-gray-600">Ocupado</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-gray-600">Atrasado</span>
            </span>
          </div>
        </div>

        {/* Grade */}
        <div className="p-5">
          {loadingLockers ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {lockersSafe.map((l) => (
                <LockerTile key={l._id} locker={l} />
              ))}
              {/* Tile “Adicionar” */}
              <Link
                href="/dashboard/lockers/new"
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500 gap-2 h-[116px]"
                title="Adicionar armário"
              >
                <Plus className="h-6 w-6" />
                <span className="text-xs font-medium">Adicionar</span>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
