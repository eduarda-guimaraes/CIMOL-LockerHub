"use client";

import Link from "next/link";
import { useAuth } from "@/components/Auth/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Plus,
  User2,
  Filter,
} from "lucide-react";

/* =======================
 * Tipos
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
  code: string;
  status: Status;
  occupantName?: string | null;
  occupantId?: string | null;
}

interface OverdueRental {
  _id: string;
  lockerCode: string;
  studentName: string;
  studentId?: string | null;
}

interface StudentMini {
  _id: string;
  nome: string;
}

/* =======================
 * Helpers (sem any)
 * ======================= */
type Dict = Record<string, unknown>;
const asObj = (v: unknown): Dict | undefined =>
  v !== null && typeof v === "object" ? (v as Dict) : undefined;
const asStr = (v: unknown, fb = ""): string =>
  typeof v === "string" ? v : fb;
const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** Busca recursivamente o primeiro array encontrado em um JSON arbitrário */
const findFirstArray = (v: unknown): unknown[] => {
  if (Array.isArray(v)) return v;
  const o = asObj(v);
  if (!o) return [];
  for (const child of Object.values(o)) {
    const arr = findFirstArray(child);
    if (arr.length) return arr;
  }
  return [];
};

/** Parse super tolerante de data */
const parseDate = (raw: unknown): Date | null => {
  if (raw == null) return null;

  // number (epoch ms) ou string numérica
  if (typeof raw === "number") {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return null;

    // ISO/UTC padrão
    const iso = new Date(s);
    if (!Number.isNaN(iso.getTime())) return iso;

    // DD/MM/YYYY (BR)
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const dd = Number(m[1]);
      const mm = Number(m[2]) - 1;
      const yyyy = Number(m[3]);
      const d = new Date(yyyy, mm, dd);
      if (d.getFullYear() === yyyy && d.getMonth() === mm && d.getDate() === dd) {
        return d;
      }
    }
  }

  // Mongo/Firestore-like { $date: "..."}  ou Timestamp { seconds, nanoseconds }
  const o = asObj(raw);
  if (o && "$date" in o) {
    const d = new Date(asStr(o.$date));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (o && "seconds" in o) {
    const sec = typeof o.seconds === "number" ? o.seconds : Number(o.seconds);
    if (!Number.isNaN(sec)) {
      return new Date(sec * 1000);
    }
  }

  return null;
};

const pickDate = (o?: Dict, keys: string[] = []): Date | null => {
  for (const k of keys) {
    const d = parseDate(o?.[k]);
    if (d) return d;
  }
  return null;
};

/* =======================
 * Fetchers (com normalização forte)
 * ======================= */
const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/api/dashboard/stats");
  return data;
};

const fetchStudentsMini = async (): Promise<StudentMini[]> => {
  const { data } = await api.get("/api/students");
  const list = asArr(data);
  return list
    .map((raw): StudentMini | null => {
      const s = asObj(raw);
      if (!s) return null;
      const _id = asStr(s._id) || asStr(s.id);
      const nome = asStr(s.nome) || asStr(s.name);
      if (!_id) return null;
      return { _id, nome: nome || "Aluno(a)" };
    })
    .filter(Boolean) as StudentMini[];
};

const DUE_KEYS = [
  "dataPrevista",
  "dueDate",
  "previsaoDevolucao",
  "dataPrevistaDevolucao",
  "data_devolucao_prevista",
  "dataFimPrevista",
  "dataFim",
  "fimPrevisto",
  "dataSaidaPrevista",
];

const RETURNED_KEYS = [
  "dataDevolucao",
  "returnedAt",
  "devolvidoEm",
  "data_devolucao",
];

const normalizeOverdueWithDates = (
  raw: unknown
): (OverdueRental & { due?: Date | null; returned?: Date | null }) | null => {
  const base = asObj(raw) ?? {};
  const r =
    asObj(base.rental) ??
    asObj(base.locacao) ??
    base;

  const locker = asObj(r.locker) ?? asObj(r.armario);
  const student =
    asObj(r.student) ??
    asObj(r.aluno) ??
    asObj(r.user);

  const studentId =
    asStr(r.studentId) ||
    asStr(student?._id) ||
    asStr(r.alunoId) ||
    asStr(r.userId) ||
    null;

  const lockerCode =
    asStr(r.lockerCode) ||
    asStr(locker?.code) ||
    (asStr(locker?.building) && asStr(locker?.numero)
      ? `${asStr(locker?.building)}-${asStr(locker?.numero)}`
      : asStr(locker?.numero)) ||
    asStr(r.numero) ||
    "";

  const studentName =
    asStr(r.studentName) ||
    asStr(student?.nome) ||
    asStr(student?.name) ||
    "";

  const id =
    asStr(r._id) ||
    asStr(r.id) ||
    `${asStr(locker?._id, "unk")}-${studentId ?? "unk"}`;

  const due = pickDate(r, DUE_KEYS);
  const returned = pickDate(r, RETURNED_KEYS);

  if (!lockerCode) return null;
  return { _id: id, lockerCode, studentName, studentId, due, returned };
};

const fetchOverdue = async (): Promise<OverdueRental[]> => {
  const tryEndpoints = async (url: string) => {
    const { data } = await api.get(url);
    const arr = findFirstArray(data).length ? findFirstArray(data) : asArr(data);
    const norm = arr
      .map((raw) => normalizeOverdueWithDates(raw))
      .filter(Boolean) as Array<OverdueRental & { due?: Date | null; returned?: Date | null }>;
    return norm;
  };

  // 1) endpoint específico
  let items = await tryEndpoints("/api/rentals/overdue");
  // 2) endpoint com filtro
  if (items.length === 0) items = await tryEndpoints("/api/rentals?status=overdue");
  if (items.length > 0) {
    return items.map(({ _id, lockerCode, studentName, studentId }) => ({
      _id,
      lockerCode,
      studentName,
      studentId,
    }));
  }

  // 3) fallback: pega TODOS e detecta por status/data
  const { data: all } = await api.get("/api/rentals");
  const allArr = findFirstArray(all).length ? findFirstArray(all) : asArr(all);

  // 3a) tenta por campo status contendo 'overdue/late/atras'
  const statusOverdues = allArr
    .map(asObj)
    .filter(Boolean)
    .filter((r) => {
      const s = asStr(r?.status).toLowerCase();
      return s.includes("overdue") || s.includes("late") || s.includes("atras");
    })
    .map((r) => normalizeOverdueWithDates(r))
    .filter(Boolean) as Array<OverdueRental & { due?: Date | null; returned?: Date | null }>;

  // 3b) se ainda zero, usa regra por data (due < hoje && !returned)
  const byDate =
    statusOverdues.length > 0
      ? statusOverdues
      : (allArr
          .map((raw) => normalizeOverdueWithDates(raw))
          .filter(Boolean) as Array<
          OverdueRental & { due?: Date | null; returned?: Date | null }
        >).filter((r) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return r.due && (!r.returned || r.returned.getTime() === 0) && r.due.getTime() < today.getTime();
        });

  return byDate.map(({ _id, lockerCode, studentName, studentId }) => ({
    _id,
    lockerCode,
    studentName,
    studentId,
  }));
};

const fetchLockers = async (): Promise<Locker[]> => {
  const { data } = await api.get("/api/lockers", { params: { view: "grid" } });
  const list = asArr(data);

  return list.map((raw): Locker => {
    const l = asObj(raw) ?? {};

    // várias possibilidades de campo para aluguel ativo
    const activeRental =
      asObj(l.activeRental) ??
      asObj(l.aluguelAtivo) ??
      asObj(l.locacaoAtiva) ??
      asObj(l.rental) ??
      asObj(l.locacao);

    const aluno = asObj(l.aluno) ?? asObj(l.student);
    const student = asObj(activeRental?.student) ?? aluno;

    const occupantId =
      asStr(l.occupantId) ||
      asStr(activeRental?.studentId) ||
      asStr(student?._id) ||
      asStr(l.studentId) ||
      asStr(l.alunoId) ||
      null;

    const code =
      asStr(l.code) ||
      (asStr(l.building) && asStr(l.numero)
        ? `${asStr(l.building)}-${asStr(l.numero)}`
        : asStr(l.numero) || "—");

    const due = pickDate(activeRental, DUE_KEYS);
    const returnedAt = pickDate(activeRental, RETURNED_KEYS);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = !!(due && !returnedAt && due.getTime() < today.getTime());

    let status: Status =
      (asStr(l.status) as Status) || (activeRental ? "occupied" : "available");
    if (isOverdue) status = "overdue";

    const occupantName =
      asStr(l.occupantName) ||
      asStr(student?.nome) ||
      asStr(student?.name) ||
      null;

    const id = asStr(l._id) || asStr(l.id) || code;

    return { _id: id, code, status, occupantName, occupantId };
  });
};

/* =======================
 * UI
 * ======================= */
const statusStyles: Record<
  Status,
  { chip: string; tile: string; ring: string; label: string }
> = {
  available: {
    chip: "bg-green-100 text-green-700",
    tile: "bg-green-50 hover:bg-green-100 border-green-200",
    ring: "ring-green-200",
    label: "Desocupado",
  },
  occupied: {
    chip: "bg-blue-100 text-blue-700",
    tile: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    ring: "ring-blue-200",
    label: "Ocupado",
  },
  overdue: {
    chip: "bg-red-100 text-red-700",
    tile: "bg-red-50 hover:bg-red-100 border-red-200",
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
            <div
              className={`flex-shrink-0 p-3 rounded-md bg-opacity-20 ${colorClass.replace(
                "text",
                "bg"
              )}`}
            >
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

const OverdueMiniCard = ({
  item,
  studentsMap,
}: {
  item: OverdueRental;
  studentsMap: Map<string, string>;
}) => {
  const displayName =
    item.studentName?.trim() ||
    (item.studentId ? studentsMap.get(item.studentId) : "") ||
    "Aluno(a)";
  return (
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
        <div className="text-sm font-medium text-gray-800 truncate">{displayName}</div>
      </div>
    </Link>
  );
};

const LockerTile = ({
  locker,
  studentsMap,
}: {
  locker: Locker;
  studentsMap: Map<string, string>;
}) => {
  const s = statusStyles[locker.status];
  const displayName =
    locker.occupantName || (locker.occupantId ? studentsMap.get(locker.occupantId) : "");

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

      {displayName ? (
        <div className="mt-3 text-[11px] text-gray-500 truncate">
          <span className="font-medium text-gray-700">Aluno:</span> {displayName}
        </div>
      ) : (
        <div className="mt-3 text-[11px] text-gray-400 italic">Sem ocupante</div>
      )}
    </button>
  );
};

/** Deriva a lista de atrasados a partir da grade de armários (fallback real) */
const deriveOverdueFromLockers = (lockers: Locker[]): OverdueRental[] =>
  lockers
    .filter((l) => l.status === "overdue")
    .map<OverdueRental>((l) => ({
      _id: `locker-${l._id}`,
      lockerCode: l.code,
      studentName: l.occupantName || "",
      studentId: l.occupantId || undefined,
    }));

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading: loadingStats } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  const { data: students, isLoading: loadingStudents } = useQuery<StudentMini[]>({
    queryKey: ["studentsMini"],
    queryFn: fetchStudentsMini,
  });
  const studentsMap = new Map<string, string>((students ?? []).map((s) => [s._id, s.nome]));

  const { data: overdue, isLoading: loadingOverdue } = useQuery<OverdueRental[]>({
    queryKey: ["overdueRentals"],
    queryFn: fetchOverdue,
  });

  const { data: lockers, isLoading: loadingLockers } = useQuery<Locker[]>({
    queryKey: ["lockersGrid"],
    queryFn: fetchLockers,
  });

  // Fallbacks em cascata
  const overdueDisplay: OverdueRental[] =
    (overdue && overdue.length > 0
      ? overdue
      : lockers
      ? deriveOverdueFromLockers(lockers)
      : []) ?? [];

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
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
          icon={User2}
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


      {/* Faixa de Atrasados */}
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

        {loadingStudents || (loadingOverdue && loadingLockers) ? (
          <div className="flex gap-4 overflow-x-auto">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[140px] h-[88px] rounded-lg bg-white shadow-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {overdueDisplay.map((o) => (
              <OverdueMiniCard key={o._id} item={o} studentsMap={studentsMap} />
            ))}
            {overdueDisplay.length === 0 && (
              <div className="text-sm text-gray-500">Nenhum atraso encontrado.</div>
            )}
          </div>
        )}
      </section>

      {/* Armários */}
      <section className="rounded-xl border bg-white shadow">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900">Armários</h2>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              <Filter className="h-4 w-4" />
              <span>Filtrar (em breve)</span>
            </div>
          </div>
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

        <div className="p-5">
          {loadingLockers || loadingStudents ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(lockers ?? []).map((l) => (
                <LockerTile key={l._id} locker={l} studentsMap={studentsMap} />
              ))}
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
