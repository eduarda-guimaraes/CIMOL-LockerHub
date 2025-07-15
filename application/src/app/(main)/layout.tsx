"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { useAuth } from "@/components/Auth/AuthContext";
import { LogOut, Users, Package, GraduationCap, LayoutDashboard } from "lucide-react";

const NavLink = ({ href, children }: { href: string, children: ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-white/20 text-black' : 'text-gray-700 hover:bg-white/10 hover:text-black'}`}>
      {children}
    </Link>
  );
};

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <aside className="w-64 bg-yellow-400 text-blue-700 flex-col hidden md:flex uppercase font-sans">
          <div className="h-20 flex items-center justify-center text-xl font-bold border-b border-white/10">
            Cimol Locker
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            <NavLink href="/dashboard"><LayoutDashboard size={18} /> Dashboard</NavLink>
            <NavLink href="/dashboard/courses"><Package size={18} /> Cursos</NavLink>
            <NavLink href="/dashboard/students"><GraduationCap size={18} /> Alunos</NavLink>
            <NavLink href="/dashboard/lockers"><Package size={18} /> Armários</NavLink>
            {user?.role === "admin" && (
              <NavLink href="/dashboard/users"><Users size={18} /> Usuários</NavLink>
            )}
          </nav>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="bg-blue-700 shadow-sm h-20 flex items-center justify-end px-4 md:px-8">
            <div className="flex items-center gap-4">
              {user && <span className="text-sm font-medium text-gray-700 hidden sm:block">Olá, {user.nome}</span>}
              <button onClick={logout} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Sair"><LogOut size={20} /></button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 bg-brand-gray-light overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}