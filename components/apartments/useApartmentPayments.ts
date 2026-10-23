'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchPayments, postPayment, removePayment, type PaymentDraft, type PaymentItem } from './paymentFormApi';

export function useApartmentPayments(apartmentId: number, onChanged: () => void) {
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchPayments(apartmentId));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [apartmentId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const add = async (draft: PaymentDraft) => {
    setSaving(true);
    try {
      await postPayment(apartmentId, draft);
      await reload();
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (paymentId: number) => {
    if (!confirm('Delete this payment?')) return;
    try {
      await removePayment(apartmentId, paymentId);
      await reload();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment');
    }
  };

  return { items, loading, saving, error, add, remove };
}
