// application/src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Idealmente, a URL da API viria de uma variável de ambiente
const API_URL = 'http://localhost:5001/api/auth/login';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: (credentials: any) => axios.post(API_URL, credentials),
    onSuccess: (response) => {
      // O accessToken vem no corpo da resposta
      const { accessToken, user } = response.data;
      
      // A melhor prática é armazenar o accessToken em memória (usando um state manager como Zustand ou Context)
      // Para este exemplo, vamos simplificar e usar sessionStorage, mas CUIDADO em produção.
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('user', JSON.stringify(user));

      // O refreshToken foi salvo no cookie HttpOnly pelo backend.
      
      // Redireciona para o dashboard
      router.push('/dashboard'); 
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Ocorreu um erro ao fazer login.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ email, password });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
        <h2>Login LockerHub</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={{ padding: '8px', color: '#000' }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required
          style={{ padding: '8px', color: '#000' }}
        />
        <button type="submit" disabled={loginMutation.isPending} style={{ padding: '10px', cursor: 'pointer' }}>
          {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}