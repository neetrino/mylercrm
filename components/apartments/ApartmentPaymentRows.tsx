'use client';

import { formatAmd } from '@/lib/formatAmd';
import type { PaymentItem } from './paymentFormApi';

type ApartmentPaymentRowsProps = {
  items: PaymentItem[];
  onDelete: (id: number) => void;
};

export function ApartmentPaymentRows({ items, onDelete }: ApartmentPaymentRowsProps) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500">No payments yet. The current total paid stays until the first row is added.</p>;
  }

  return (
    <ul className="mb-4 divide-y divide-gray-100">
      {items.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-3 py-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">{formatAmd(item.amount)}</p>
            <p className="text-xs text-gray-500">
              {item.paidAt}
              {item.method ? ` · ${item.method}` : ''}
              {item.createdByEmail ? ` · ${item.createdByEmail}` : ''}
            </p>
            {item.note ? <p className="mt-1 text-sm text-gray-700">{item.note}</p> : null}
          </div>
          <button type="button" onClick={() => onDelete(item.id)} className="text-sm text-red-600 hover:text-red-800">
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
