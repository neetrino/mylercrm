'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    <div className="sheet-panel fixed inset-0 z-50 flex justify-end p-3 sm:p-4">
      <button type="button" aria-label="Close details" className="absolute inset-0 bg-blue-950/30 backdrop-blur-sm" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Apartment details"
        className="sheet-drawer relative z-10 flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-card"
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <ApartmentCard
            apartmentId={apartmentId}
            currentUserId={currentUserId}
            currentUserEmail={currentUserEmail}
            embedded
            onClose={onClose}
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
