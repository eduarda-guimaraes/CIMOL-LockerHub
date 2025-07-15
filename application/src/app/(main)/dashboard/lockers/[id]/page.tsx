// application/src/app/(main)/dashboard/lockers/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PopulatedLocker } from '@/services/locker.service';
import Spinner from '@/components/ui/Spinner';
import InfoCard from '@/components/ui/InfoCard';
import { ArrowLeft, Building, GraduationCap, Hash, User, Calendar, CheckCircle, XCircle } from 'lucide-react';

// Esta função para buscar detalhes continua a mesma
const fetchLockerDetails = async (id: string): Promise<PopulatedLocker> => {
  const { data } = await api.get<PopulatedLocker>(`/api/lockers/${id}`);
  return data;
};

export default function LockerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const lockerId = params.id as string;

  const { data: locker, isLoading, error } = useQuery({
    queryKey: ['lockerDetails', lockerId],
    queryFn: () => fetchLockerDetails(lockerId),
    enabled: !!lockerId,
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (error || !locker) {
    return (
      <div className="text-center text-red-500">
        <p>Erro ao carregar informações do armário.</p>
        <button onClick={() => router.back()} className="mt-4 text-brand-blue hover:underline">Voltar</button>
      </div>
    );
  }

  const ocupacao = locker.activeRental;

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-brand-gray hover:text-brand-blue-dark mb-6 font-medium">
        <ArrowLeft size={20} />
        Voltar para a lista de armários
      </button>

      <h1 className="text-3xl font-bold text-brand-blue-dark mb-8">
        Detalhes do Armário {locker.numero}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Informações do Armário">
          <p className="flex items-center gap-3"><Hash size={18} className="text-brand-blue"/> <strong>Número:</strong> {locker.numero}</p>
          <p className="flex items-center gap-3"><Building size={18} className="text-brand-blue"/> <strong>Prédio:</strong> {locker.building}</p>
          <p className="flex items-center gap-3"><GraduationCap size={18} className="text-brand-blue"/> <strong>Curso:</strong> {locker.courseId.nome}</p>
          <p className="flex items-center gap-3">
            {locker.status === 'available' ? <CheckCircle size={18} className="text-status-green"/> : <XCircle size={18} className="text-status-red"/>}
            <strong>Status:</strong> <span className={`font-semibold ${locker.status === 'available' ? 'text-status-green' : 'text-status-red'}`}>{locker.status === 'available' ? 'Disponível' : 'Ocupado'}</span>
          </p>
        </InfoCard>

        <InfoCard title="Ocupação Atual">
          {ocupacao ? (
            <>
              {/* CORREÇÃO APLICADA AQUI: Usando 'Não identificado' para evitar erro de tipo */}
              <p className="flex items-center gap-3"><User size={18} className="text-brand-blue"/> <strong>Aluno:</strong> {ocupacao.studentId?.nome || 'Não identificado'}</p>
              <p className="flex items-center gap-3"><Calendar size={18} className="text-brand-blue"/> <strong>Início do Aluguel:</strong> {new Date(ocupacao.datas.inicio).toLocaleDateString()}</p>
              <p className="flex items-center gap-3"><Calendar size={18} className="text-brand-blue"/> <strong>Devolução Prevista:</strong> {new Date(ocupacao.datas.prevista).toLocaleDateString()}</p>
            </>
          ) : (
            <p className="text-brand-gray">Este armário está disponível.</p>
          )}
        </InfoCard>
      </div>
    </div>
  );
}