'use client';

import Link from 'next/link';
import { Poppins } from 'next/font/google';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
});

export default function CadastroPage() {
  const [curso, setCurso] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curso, nome, email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.error || 'Erro no cadastro');
        return;
      }

      setMensagem('Cadastro realizado com sucesso!');
      setCurso('');
      setNome('');
      setEmail('');
      setSenha('');
      setConfirmarSenha('');
    } catch {
      setErro('Erro ao conectar com o servidor');
    }
  }

  return (
    <main className="flex h-screen w-full">
      {/* Esquerda */}
      <section className="w-1/2 bg-blue-900 text-white flex flex-col items-start justify-center p-10">
        <h1 className={`text-4xl font-bold mb-4 ${poppins.className}`}>
          Bem vindo!
        </h1>
        <p className="max-w-md text-left px-2">
          Vamos começar esta jornada mais organizada? Preencha com suas informações.
          Já tem uma conta?{' '}
          <Link href="/login" className="underline text-blue-200 hover:text-white">
            Faça Login
          </Link>
        </p>
      </section>

      {/* Direita */}
      <section className="w-1/2 bg-white flex flex-col justify-center items-center p-10">
        <h2 className={`text-2xl font-bold text-gray-800 mb-6 ${poppins.className}`}>
          Se Inscreva
        </h2>

        <div className="flex gap-4 mb-6">
          <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">f</button>
          <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">G</button>
          <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">in</button>
        </div>

        <p className="text-sm text-gray-500 mb-6">Ou use seu email e senha</p>

        <form onSubmit={handleSubmit} className="flex flex-col w-3/4 max-w-md gap-4">
          <div className="flex gap-2">
            <select
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              className="w-1/2 px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700"
              required
            >
              <option value="">Curso</option>
              <option value="Eletrônica">Eletrônica</option>
              <option value="Eletrotécnica">Eletrotécnica</option>
              <option value="Mecânica">Mecânica</option>
              <option value="Design de móveis">Design de móveis</option>
              <option value="Móveis">Móveis</option>
              <option value="Informática">Informática</option>
              <option value="Química">Química</option>
              <option value="Meio Ambiente">Meio Ambiente</option>
            </select>

            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-1/2 px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700"
              required
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700"
            required
          />

          {/* Senha */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label="Mostrar senha"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirmar senha */}
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label="Mostrar senha"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          {mensagem && <p className="text-green-600 text-sm">{mensagem}</p>}

          <button
            type="submit"
            className="mt-4 bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-md font-semibold"
          >
            Pronto
          </button>
        </form>
      </section>
    </main>
  );
}
