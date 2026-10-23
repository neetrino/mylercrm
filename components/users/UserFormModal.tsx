'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useCloseOnEscape } from '@/components/ui/useCloseOnEscape';

type UserFormModalProps = {
  children: ReactNode;
  onClose: () => void;
};

export function UserFormModal({ children, onClose }: UserFormModalProps) {
  useCloseOnEscape(onClose);
  useEffect(() => {
    document.documentElement.classList.add('overflow-hidden');
    return () => {
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[200] flex h-dvh w-screen items-center justify-center bg-black/60 p-4">
      {children}
    </div>,
    document.body,
  );
}
