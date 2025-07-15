// application/src/components/ui/Modal.tsx
"use client";

import { ReactNode, MouseEvent } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  // --- CORREÇÃO APLICADA AQUI ---
  children?: ReactNode; // Tornamos a prop 'children' opcional com '?'
  // --- FIM DA CORREÇÃO ---
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

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {children && <div>{children}</div>}
        {footer && (
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 mt-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
