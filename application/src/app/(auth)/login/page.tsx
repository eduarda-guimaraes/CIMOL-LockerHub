'use client';

import Link from 'next/link';
import { Poppins } from 'next/font/google';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.error || 'Credenciais inválidas');
        return;
      }

      setSucesso('Login bem-sucedido!');
      console.log('Usuário autenticado:', data);

      // TODO: redirecionar, salvar token, etc.
    } catch {
      setErro('Erro ao conectar com o servidor');
    }
  }

  return (
    <main className="flex h-screen w-full">
      {/* Esquerda */}
      <section className="w-1/2 bg-blue-900 text-white flex flex-col items-start justify-center p-8">
        <h1 className={`text-4xl font-bold mb-4 ${poppins.className}`}>
          Bem-vindo!
        </h1>
        <p className="max-w-md text-left px-2">
          Entre com as suas informações principais. Se ainda não tiver uma conta,{' '}
          <Link href="/cadastro" className="underline text-blue-200 hover:text-white">
            Crie uma
          </Link>.
        </p>
      </section>

      {/* Direita */}
      <section className="w-1/2 bg-white flex flex-col justify-center items-center p-10">
        <h2 className={`text-2xl font-bold text-gray-800 mb-6 ${poppins.className}`}>
          Faça Login
        </h2>

        {/* Login social */}
        <div className="flex gap-4 mb-6">
          <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">f</button>
          <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">G</button>
          <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">in</button>
        </div>

        <p className="text-sm text-gray-500 mb-6">Ou use seu email e senha</p>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="flex flex-col w-3/4 max-w-md gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-label="Mostrar senha"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          {sucesso && <p className="text-green-600 text-sm">{sucesso}</p>}

          <div className="text-right">
            <Link href="/recuperar-senha" className="text-sm text-gray-400 hover:text-gray-600">
              Esqueceu sua Senha?
            </Link>
          </div>

          <button
            type="submit"
            className="mt-4 bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-md font-semibold"
          >
            Login
          </button>
        </form>
      </section>
    </main>
  );
}
