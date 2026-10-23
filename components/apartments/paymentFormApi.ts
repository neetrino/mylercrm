export type PaymentItem = {
  id: number;
  amount: number;
  paidAt: string;
  method: string | null;
  note: string | null;
  createdByEmail: string | null;
};

export type PaymentDraft = {
  amount: string;
  paidAt: string;
  method: string;
  note: string;
};

async function readError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => ({}));
  return typeof body.error === 'string' ? body.error : fallback;
}

export async function fetchPayments(apartmentId: number): Promise<PaymentItem[]> {
  const response = await fetch(`/api/apartments/${apartmentId}/payments`, { cache: 'no-store' });
  if (!response.ok) throw new Error(await readError(response, 'Failed to load payments'));
  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
}

export async function postPayment(apartmentId: number, draft: PaymentDraft): Promise<void> {
  const amount = Number(draft.amount);
  const response = await fetch(`/api/apartments/${apartmentId}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      paidAt: draft.paidAt,
      method: draft.method.trim() || null,
      note: draft.note.trim() || null,
    }),
  });
  if (!response.ok) throw new Error(await readError(response, 'Failed to add payment'));
}

export async function removePayment(apartmentId: number, paymentId: number): Promise<void> {
  const response = await fetch(`/api/apartments/${apartmentId}/payments/${paymentId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(await readError(response, 'Failed to delete payment'));
}
