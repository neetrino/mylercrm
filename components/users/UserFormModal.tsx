'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type UserFormModalProps = {
  children: ReactNode;
};

export function UserFormModal({ children }: UserFormModalProps) {
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
