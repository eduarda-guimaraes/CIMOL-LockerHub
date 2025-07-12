// application/src/app/(auth)/cadastro/page.tsx
'use client';

import Link from 'next/link';
import { Poppins } from 'next/font/google';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
});

// --- MODIFICAÇÃO AQUI: Schema de validação com Zod ---
const registerSchema = z
  .object({
    // TODO: O courseId deve vir de uma busca na API, não de uma lista hardcoded.
    // Por enquanto, validamos como uma string não vazia.
    curso: z.string().min(1, { message: 'Por favor, selecione um curso.' }),
    nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
    email: z.string().email({ message: 'Por favor, insira um email válido.' }),
    senha: z.string().min(8, { message: 'A senha deve ter no mínimo 8 caracteres.' }),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas não coincidem.',
    path: ['confirmarSenha'], // O erro será aplicado ao campo 'confirmarSenha'
  });

// Inferindo o tipo dos dados do formulário a partir do schema Zod
type RegisterFormData = z.infer<typeof registerSchema>;

export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // --- MODIFICAÇÃO AQUI: useMutation para chamadas à API ---
  const { mutate: registerUser, isPending, error } = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const { curso, nome, email, senha } = data;
      // O nome do campo no formulário é 'curso', mas a API espera 'courseId'.
      const payload = { courseId: curso, nome, email, password: senha };
      const { data: responseData } = await axios.post('/api/auth/register', payload);
      return responseData;
    },
    onSuccess: () => {
      // TODO: Usar um sistema de notificação (toast) para a mensagem de sucesso.
      alert('Cadastro realizado com sucesso! Você será redirecionado para o login.');
      router.push('/login');
    },
    // onError é tratado automaticamente pelo hook 'error'
  });

  // --- MODIFICAÇÃO AQUI: useForm para gerenciamento do formulário ---
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      curso: '',
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
    },
  });

  // Função de submissão que chama a mutação
  const onSubmit = (data: RegisterFormData) => {
    registerUser(data);
  };

  // Extraindo a mensagem de erro da API
  const apiErrorMessage = error instanceof AxiosError ? error.response?.data?.message : null;

  return (
    <main className="flex h-screen w-full">
      {/* Esquerda */}
      <section className="w-1/2 bg-blue-900 text-white flex flex-col items-start justify-center p-10">
        <h1 className={`text-4xl font-bold mb-4 ${poppins.className}`}>Bem vindo!</h1>
        <p className="max-w-md text-left px-2">
          Vamos começar esta jornada mais organizada? Preencha com suas informações. Já tem uma conta?{' '}
          <Link href="/login" className="underline text-blue-200 hover:text-white">
            Faça Login
          </Link>
        </p>
      </section>

      {/* Direita */}
      <section className="w-1/2 bg-white flex flex-col justify-center items-center p-10">
        <h2 className={`text-2xl font-bold text-gray-800 mb-6 ${poppins.className}`}>Se Inscreva</h2>
        <div className="flex gap-4 mb-6">
          <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">f</button>
          <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">G</button>
          <button className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100">in</button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Ou use seu email e senha</p>

        {/* --- MODIFICAÇÃO AQUI: Formulário controlado pelo React Hook Form --- */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-3/4 max-w-md gap-4">
          <div className="flex gap-2">
            <div className="w-1/2 flex flex-col">
              <select
                {...register('curso')}
                className="px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700"
              >
                <option value="">Curso</option>
                {/* TODO: Estes valores devem ser dinâmicos, vindos da API. */}
                <option value="667c9951336152174a815a77">Informática</option>
                <option value="667c9951336152174a815a78">Mecânica</option>
              </select>
              {errors.curso && <p className="text-red-500 text-xs mt-1">{errors.curso.message}</p>}
            </div>
            <div className="w-1/2 flex flex-col">
              <input
                type="text"
                placeholder="Nome"
                {...register('nome')}
                className="px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700"
              />
              {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
            </div>
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              {...register('email')}
              className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              {...register('senha')}
              className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 pr-10"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.senha && <p className="text-red-500 text-xs mt-1">{errors.senha.message}</p>}
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar senha"
              {...register('confirmarSenha')}
              className="w-full px-4 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-700 pr-10"
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.confirmarSenha && <p className="text-red-500 text-xs mt-1">{errors.confirmarSenha.message}</p>}
          </div>

          {apiErrorMessage && <p className="text-red-500 text-sm">{apiErrorMessage}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="mt-4 bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-md font-semibold disabled:bg-gray-400"
          >
            {isPending ? 'Cadastrando...' : 'Pronto'}
          </button>
        </form>
      </section>
    </main>
  );
}