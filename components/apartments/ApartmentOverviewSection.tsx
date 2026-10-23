'use client';

import { formatAmd } from '@/lib/formatAmd';
import type { Dispatch, SetStateAction } from 'react';
import { getSalesTypeLabel, getSalesTypeValue, type Apartment } from './apartmentCardModel';

type ApartmentOverviewSectionProps = {
  apartment: Apartment;
  editing: boolean;
  formData: Partial<Apartment>;
  setFormData: Dispatch<SetStateAction<Partial<Apartment>>>;
};

export function ApartmentOverviewSection(props: ApartmentOverviewSectionProps) {
  const { apartment, editing, formData, setFormData } = props;
  return (
    <>
          {/* Basic Information Section */}
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Basic Information</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Apartment No
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.apartmentNo ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        apartmentNo: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="e.g. 12-05"
                    maxLength={50}
                    required
                  />
                ) : (
                  <p className="text-base font-medium text-gray-900">{apartment.apartmentNo}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Apt name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.apartmentName ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        apartmentName: e.target.value,
                      })
                    }
                    className="input-field"
                    placeholder="Optional display name"
                    maxLength={255}
                  />
                ) : (
                  <p className="text-base font-medium text-gray-900">
                    {apartment.apartmentName?.trim() || '—'}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Apartment Type
                </label>
                {editing ? (
                  <input
                    type="number"
                    min={1}
                    value={formData.apartmentType ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        apartmentType: e.target.value === '' ? null : parseInt(e.target.value, 10),
                      })
                    }
                    className="input-field"
                    placeholder="Type number"
                  />
                ) : (
                  <p className="text-base font-medium text-gray-900">{apartment.apartmentType ?? '-'}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Floor
                </label>
                {editing ? (
                  <input
                    type="number"
                    value={formData.floor ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        floor: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    className="input-field"
                  />
                ) : (
                  <p className="text-base font-medium text-gray-900">{apartment.floor ?? '-'}</p>
                )}
              </div>

              {/* Editable fields below */}
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Sq/m
                </label>
                {editing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sqm || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sqm: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="input-field"
                  />
                ) : (
                  <p className="text-base font-medium text-gray-900">
                    {apartment.sqm ? `${apartment.sqm} m²` : '-'}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Price Sq/m
                </label>
                {editing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_sqm || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_sqm: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="input-field"
                  />
                ) : (
                  <p className="text-base font-medium text-gray-900">
                    {apartment.price_sqm != null
                      ? formatAmd(apartment.price_sqm)
                      : '-'}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Sales Type
                </label>
                {editing ? (
                  <select
                    value={getSalesTypeLabel(apartment.salesType)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salesType: getSalesTypeValue(e.target.value),
                      })
                    }
                    className="input-field"
                  >
                    <option>Unsold</option>
                    <option>Mortgage</option>
                    <option>Cash</option>
                    <option>Time-based</option>
                  </select>
                ) : (
                  <p className="text-base font-medium text-gray-900">
                    {getSalesTypeLabel(apartment.salesType)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Information Section: Total Price, Total Paid, Balance Remaining (auto) */}
          {(() => {
            const totalPrice = apartment.total_price ?? 0;
            const totalPaid = editing
              ? (typeof formData.total_paid === 'number' ? formData.total_paid : (apartment.total_paid ?? 0))
              : (apartment.total_paid ?? 0);
            const balanceRemaining = totalPrice - totalPaid;
            const showBalanceRemaining =
              apartment.status === 'SOLD' || apartment.status === 'RESERVED' || totalPaid > 0;
            return (
              <div className="card p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Financial Information</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                      Total Price (cost)
                    </label>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalPrice > 0 ? formatAmd(totalPrice) : '–'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                      Total Paid
                    </label>
                    {editing ? (
                      <input
                        type="number"
                        min={0}
                        value={formData.total_paid ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            total_paid: e.target.value === '' ? null : parseFloat(e.target.value),
                          })
                        }
                        className="input-field mt-2"
                        placeholder="AMD"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        {totalPaid > 0 ? formatAmd(totalPaid) : '–'}
                      </p>
                    )}
                  </div>
                  {showBalanceRemaining && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                        Balance Remaining (to pay)
                      </label>
                      <p className="text-2xl font-bold text-gray-900">
                        {balanceRemaining >= 0
                          ? formatAmd(balanceRemaining)
                          : '–'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">Total Price − Total Paid</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
    </>
  );
}
