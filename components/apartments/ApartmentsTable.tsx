'use client';

import Link from 'next/link';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { formatAmd } from '@/lib/formatAmd';
import { APARTMENT_STATUS_OPTIONS } from './apartmentStatusOptions';
import { InReviewBadge } from './InReviewBadge';
import type { ApartmentListRow, EditedFields } from './apartmentListTypes';
import { activeReview, isLockedByOther } from '@/lib/inReview';

type HeaderAlign = 'left' | 'right';

type SortableHeaderProps = {
  field: string;
  label: string;
  align?: HeaderAlign;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
};

function SortableHeader({ field, label, align = 'left', sortBy, sortOrder, onSort }: SortableHeaderProps) {
  const isActive = sortBy === field;
  return (
    <th
      className={`px-6 py-3 text-${align} text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:bg-gray-100 transition-colors`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <span className="text-gray-400">
          {isActive ? (
            sortOrder === 'asc' ? '↑' : '↓'
          ) : (
            <span className="text-gray-300">⇅</span>
          )}
        </span>
      </div>
    </th>
  );
}

type ApartmentsTableProps = {
  apartments: ApartmentListRow[];
  editedFields: EditedFields;
  listBulkEditMode: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  handleFieldEdit: (id: number, field: 'apartmentNo' | 'apartmentName', value: string) => void;
  handleStatusChange: (id: number, status: string) => void;
  getStatusColor: (status: string) => string;
  currentUserId: string;
};

export function ApartmentsTable(props: ApartmentsTableProps) {
  const {
    apartments,
    editedFields,
    listBulkEditMode,
    sortBy,
    sortOrder,
    onSort,
    handleFieldEdit,
    handleStatusChange,
    getStatusColor,
    currentUserId,
  } = props;

  return (
    <>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <SortableHeader field="apartmentNo" label="No" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Apt Name
                  </th>
                  <SortableHeader field="building" label="Building" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                  <SortableHeader field="status" label="Status" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                  <SortableHeader field="sqm" label="Area (m²)" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                  <SortableHeader field="total_price" label="Price" align="right" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                  <SortableHeader field="total_paid" label="Paid" align="right" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                  <SortableHeader field="balance" label="Balance" align="right" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {apartments.map((apt) => {
                  const edits = editedFields[apt.id];
                  const noEdited = edits?.apartmentNo !== undefined;
                  const nameEdited = edits?.apartmentName !== undefined;
                  const review = activeReview(apt.in_review);

                  return (
                    <tr
                      key={apt.id}
                      className={`hover:bg-gray-50 ${listBulkEditMode && (noEdited || nameEdited) ? 'bg-amber-50/50' : ''}`}
                    >
                      <td className="whitespace-nowrap px-3 py-2">
                        {listBulkEditMode ? (
                          <input
                            type="text"
                            key={`${apt.id}-no-${apt.apartmentNo}`}
                            defaultValue={apt.apartmentNo}
                            onChange={(e) => handleFieldEdit(apt.id, 'apartmentNo', e.target.value)}
                            className={`w-24 rounded-md border px-2 py-1.5 text-sm font-medium text-gray-900 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
                              noEdited ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-transparent'
                            }`}
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900">{apt.apartmentNo}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">
                        {listBulkEditMode ? (
                          <input
                            type="text"
                            key={`${apt.id}-name-${apt.apartmentName ?? ''}`}
                            defaultValue={apt.apartmentName ?? ''}
                            placeholder="—"
                            onChange={(e) => handleFieldEdit(apt.id, 'apartmentName', e.target.value)}
                            className={`w-40 rounded-md border px-2 py-1.5 text-sm text-gray-900 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
                              nameEdited ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-transparent'
                            }`}
                          />
                        ) : (
                          <span className="text-sm text-gray-900">{apt.apartmentName?.trim() || '—'}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-2 text-sm text-gray-500">
                        {apt.building.district.name} - {apt.building.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-2">
                        <div className="flex flex-col items-start gap-1">
                          <DropdownSelect
                            value={apt.status}
                            disabled={isLockedByOther(review, currentUserId)}
                            onChange={(next) => handleStatusChange(apt.id, next)}
                            options={APARTMENT_STATUS_OPTIONS}
                            placeholder="Status"
                            ariaLabel="Apartment status"
                            fullWidth={false}
                            triggerClassName={`inline-flex cursor-pointer items-center gap-1 rounded-full border py-1 pl-3 pr-2.5 text-xs font-medium transition-colors ${getStatusColor(apt.status)}`}
                          />
                          {review ? <InReviewBadge email={review.email} /> : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-2 text-sm text-gray-900">
                        {apt.sqm ? `${apt.sqm} m²` : '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-2 text-right text-sm font-semibold text-gray-900">
                        {apt.total_price ? formatAmd(apt.total_price) : '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-2 text-right text-sm text-gray-900">
                        {apt.total_paid ? formatAmd(apt.total_paid) : '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-2 text-right text-sm text-gray-900">
                        {apt.balance ? formatAmd(apt.balance) : '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-2 text-right text-sm font-medium">
                        <Link
                          href={`/apartments/${apt.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
    </>
  );
}
