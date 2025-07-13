// application/src/components/ui/Modal.tsx
"use client";

import { ReactNode, MouseEvent } from "react"; // Importar MouseEvent

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  // --- MODIFICAÇÃO AQUI: Função para fechar o modal ao clicar no overlay ---
  // Verifica se o clique foi diretamente no overlay (e não nos filhos, como o card do modal)
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // --- MODIFICAÇÃO AQUI: Adicionando o onClick no overlay ---
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div>{children}</div>
        {footer && (
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 mt-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
