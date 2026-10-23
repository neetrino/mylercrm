'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useCloseOnEscape } from '@/components/ui/useCloseOnEscape';
import ApartmentCard from './ApartmentCard';

type ApartmentDetailSheetProps = {
  apartmentId: number;
  currentUserId: string;
  currentUserEmail: string;
  onClose: () => void;
};

export function ApartmentDetailSheet({
  apartmentId,
  currentUserId,
  currentUserEmail,
  onClose,
}: ApartmentDetailSheetProps) {
  useCloseOnEscape(onClose);
  useSheetScrollLock();

  return createPortal(
    <div className="sheet-panel fixed inset-0 z-40 flex justify-end">
      <button type="button" aria-label="Close details" className="absolute inset-0 bg-blue-950/40" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Apartment details"
        className="relative flex h-full w-full max-w-4xl flex-col bg-[var(--brand-ice)] shadow-card"
      >
        <div className="flex items-center justify-between border-b border-blue-100 bg-white px-5 py-3">
          <p className="text-sm font-semibold text-blue-900">Apartment details</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 hover:bg-blue-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <ApartmentCard
            apartmentId={apartmentId}
            currentUserId={currentUserId}
            currentUserEmail={currentUserEmail}
            embedded
          />
        </div>
      </aside>
    </div>,
    document.body,
  );
}

function useSheetScrollLock() {
  useEffect(() => {
    document.documentElement.classList.add('overflow-hidden');
    return () => document.documentElement.classList.remove('overflow-hidden');
  }, []);
}
