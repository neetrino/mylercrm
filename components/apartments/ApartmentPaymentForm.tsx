'use client';

import { useState } from 'react';
import { PaymentDraftFields } from './PaymentDraftFields';
import type { PaymentDraft } from './paymentFormApi';

type ApartmentPaymentFormProps = {
  saving: boolean;
  onSubmit: (draft: PaymentDraft) => Promise<void>;
};

function todayIsoDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function ApartmentPaymentForm({ saving, onSubmit }: ApartmentPaymentFormProps) {
  const [draft, setDraft] = useState<PaymentDraft>({
    amount: '',
    paidAt: todayIsoDate(),
    method: '',
    note: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await onSubmit(draft);
      setDraft({ amount: '', paidAt: draft.paidAt, method: '', note: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add payment');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {error ? <p className="text-sm text-red-700 sm:col-span-2">{error}</p> : null}
      <PaymentDraftFields draft={draft} setDraft={setDraft} />
      <button type="submit" disabled={saving} className="btn-primary w-fit sm:col-span-2">
        {saving ? 'Adding...' : 'Add payment'}
      </button>
    </form>
  );
}
