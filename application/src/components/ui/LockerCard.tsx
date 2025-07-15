import Link from 'next/link';
import { PopulatedLocker } from '@/services/locker.service';
import { KeyRound, ShieldCheck, ShieldAlert } from 'lucide-react';

interface LockerCardProps {
  locker: PopulatedLocker;
  onRent: (locker: PopulatedLocker) => void;
}

export default function LockerCard({ locker, onRent }: LockerCardProps) {
  const isOverdue = locker.status === 'occupied' && locker.activeRental && new Date(locker.activeRental.datas.prevista) < new Date();

  const statusConfig = {
    available: { bgColor: 'bg-green-100', borderColor: 'border-status-green', textColor: 'text-status-green', icon: <ShieldCheck />, text: 'Disponível' },
    occupied: { bgColor: 'bg-red-100', borderColor: 'border-status-red', textColor: 'text-status-red', icon: <KeyRound />, text: 'Ocupado' },
    overdue: { bgColor: 'bg-yellow-100', borderColor: 'border-status-yellow', textColor: 'text-status-yellow', icon: <ShieldAlert />, text: 'Atrasado' },
  };
  
  const currentStatus = isOverdue ? statusConfig.overdue : statusConfig[locker.status];

  return (
    <div className={`rounded-lg shadow-sm border-l-4 ${currentStatus.borderColor} ${currentStatus.bgColor} p-4 flex flex-col justify-between transition-transform transform hover:-translate-y-1`}>
      <div>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg text-brand-gray-dark">Nº {locker.numero}</span>
          <span className={`text-2xl ${currentStatus.textColor}`}>{currentStatus.icon}</span>
        </div>
        <p className={`text-sm font-semibold ${currentStatus.textColor}`}>{currentStatus.text}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <Link href={`/dashboard/lockers/${locker._id}`} className="flex-1 text-center text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 transition-colors">
          Detalhes
        </Link>
        {locker.status === 'available' && (
          <button onClick={() => onRent(locker)} className="flex-1 text-center text-sm bg-brand-blue text-white px-3 py-1.5 rounded-md hover:bg-opacity-80 transition-opacity">
            Alugar
          </button>
        )}
      </div>
    </div>
  );
}