'use client';

import { ApartmentPaymentForm } from './ApartmentPaymentForm';
import { ApartmentPaymentRows } from './ApartmentPaymentRows';
import { useApartmentPayments } from './useApartmentPayments';

type ApartmentPaymentsSectionProps = {
  apartmentId: number;
  onChanged: () => void;
};

export function ApartmentPaymentsSection({ apartmentId, onChanged }: ApartmentPaymentsSectionProps) {
  const payments = useApartmentPayments(apartmentId, onChanged);

  return (
    <div className="card p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment history</h2>
      {payments.error ? <p className="mb-3 text-sm text-red-700">{payments.error}</p> : null}
      {payments.loading ? (
        <p className="mb-4 text-sm text-gray-500">Loading payments...</p>
      ) : (
        <ApartmentPaymentRows items={payments.items} onDelete={payments.remove} />
      )}
      <ApartmentPaymentForm saving={payments.saving} onSubmit={payments.add} />
    </div>
  );
}
