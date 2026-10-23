'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { PaymentDraft } from './paymentFormApi';

type PaymentDraftFieldsProps = {
  draft: PaymentDraft;
  setDraft: Dispatch<SetStateAction<PaymentDraft>>;
};

export function PaymentDraftFields({ draft, setDraft }: PaymentDraftFieldsProps) {
  return (
    <>
      <input
        type="number"
        min={0.01}
        step="0.01"
        required
        placeholder="Amount"
        value={draft.amount}
        onChange={(event) => setDraft({ ...draft, amount: event.target.value })}
        className="input-field"
      />
      <input
        type="date"
        required
        value={draft.paidAt}
        onChange={(event) => setDraft({ ...draft, paidAt: event.target.value })}
        className="input-field"
      />
      <input
        type="text"
        maxLength={100}
        placeholder="Method"
        value={draft.method}
        onChange={(event) => setDraft({ ...draft, method: event.target.value })}
        className="input-field"
      />
      <input
        type="text"
        maxLength={1000}
        placeholder="Note"
        value={draft.note}
        onChange={(event) => setDraft({ ...draft, note: event.target.value })}
        className="input-field"
      />
    </>
  );
}
