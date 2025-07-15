import Link from 'next/link';
import { Package, ShieldCheck, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-white">
      <header className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-brand-blue-dark">Cimol Locker</div>
        <nav className="space-x-4 md:space-x-6">
          <Link href="/login" className="text-brand-gray hover:text-brand-blue font-medium">Login</Link>
          <Link href="/cadastro" className="bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-opacity-90 text-sm font-medium">
            Cadastre-se
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue-dark leading-tight">
          Bem-vindo ao Cimol Locker
        </h1>
        <p className="mt-4 text-md md:text-lg text-brand-gray max-w-2xl mx-auto">
          A solução moderna e eficiente para gerenciamento de armários escolares. Simplifique a logística e ofereça a melhor experiência.
        </p>
        <Link href="/cadastro" className="mt-8 inline-block bg-brand-blue text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 shadow-lg">
          Comece agora
        </Link>
      </main>

      <section className="bg-brand-blue-light py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-brand-blue-dark">O que oferecemos?</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <Package size={48} className="mx-auto text-brand-blue" />
              <h3 className="mt-4 text-xl font-semibold text-brand-gray-dark">Gestão Intuitiva</h3>
              <p className="mt-2 text-brand-gray">Visualize todos os armários em um painel simples, com status por cores e filtros rápidos.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <ShieldCheck size={48} className="mx-auto text-brand-blue" />
              <h3 className="mt-4 text-xl font-semibold text-brand-gray-dark">Controle de Acesso</h3>
              <p className="mt-2 text-brand-gray">Defina permissões para coordenadores e administradores, garantindo segurança e organização.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <Users size={48} className="mx-auto text-brand-blue" />
              <h3 className="mt-4 text-xl font-semibold text-brand-gray-dark">Foco no Aluno</h3>
              <p className="mt-2 text-brand-gray">Facilite o processo de aluguel e devolução, com histórico completo para cada estudante.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-brand-blue-dark text-white py-8 text-center">
        <p>© {new Date().getFullYear()} Cimol Locker. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}