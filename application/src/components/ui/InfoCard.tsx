import { ReactNode } from 'react';

interface InfoCardProps {
  title: string;
  children: ReactNode;
}

export default function InfoCard({ title, children }: InfoCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-brand-blue-dark border-b border-gray-200 pb-3 mb-4 font-sans">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}