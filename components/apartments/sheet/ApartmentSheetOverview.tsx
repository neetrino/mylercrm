'use client';

import { Calendar, Tag } from 'lucide-react';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { getStatusColor, type Apartment } from '../apartmentCardModel';
import { APARTMENT_STATUS_OPTIONS } from '../apartmentStatusOptions';
import {
  apartmentInitials,
  apartmentSheetFields,
  apartmentSheetStats,
  formatSheetDate,
  sheetSalesLabel,
  type SheetField,
  type SheetStat,
} from './apartmentSheetModel';

const TONE_CLASS = {
  teal: 'bg-blue-50 text-blue-700',
  pine: 'bg-green-50 text-green-700',
  sun: 'bg-yellow-50 text-yellow-800',
} as const;

const STAT_COLUMNS = 3;

type ApartmentSheetOverviewProps = {
  apartment: Apartment;
  statusLocked: boolean;
  onStatus: (status: string) => void;
};

export function ApartmentSheetOverview(props: ApartmentSheetOverviewProps) {
  return (
    <div className="space-y-4">
      <SheetStatGrid stats={apartmentSheetStats(props.apartment)} />
      <SheetProfile {...props} />
      <SheetMeta apartment={props.apartment} />
    </div>
  );
}

function SheetStatGrid({ stats }: { stats: SheetStat[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-blue-100">
      <div className="grid grid-cols-1 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <SheetStatCell key={stat.label} stat={stat} index={index} last={index === stats.length - 1} />
        ))}
      </div>
    </div>
  );
}

function SheetStatCell({ stat, index, last }: { stat: SheetStat; index: number; last: boolean }) {
  const Icon = stat.icon;
  const mobileEdge = last ? '' : 'border-b';
  const desktopCol = index % STAT_COLUMNS === STAT_COLUMNS - 1 ? 'sm:border-r-0' : 'sm:border-r';
  const desktopRow = index < STAT_COLUMNS ? 'sm:border-b' : 'sm:border-b-0';
  return (
    <div className={`border-blue-100 px-4 py-5 text-center ${mobileEdge} ${desktopCol} ${desktopRow}`}>
      <span className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full ${TONE_CLASS[stat.tone]}`}>
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{stat.label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{stat.value}</p>
    </div>
  );
}

function SheetProfile(props: ApartmentSheetOverviewProps) {
  const { apartment, statusLocked, onStatus } = props;
  return (
    <div className="rounded-3xl border border-blue-100 p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100 text-lg font-semibold text-blue-900">
          {apartmentInitials(apartment.apartmentNo)}
        </div>
        <DropdownSelect
          value={apartment.status}
          disabled={statusLocked}
          onChange={onStatus}
          options={APARTMENT_STATUS_OPTIONS}
          placeholder="Status"
          ariaLabel="Apartment status"
          align="end"
          fullWidth={false}
          triggerClassName={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${getStatusColor(apartment.status)}`}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {apartmentSheetFields(apartment).map((field) => (
          <SheetFieldCell key={field.label} field={field} />
        ))}
      </div>
    </div>
  );
}

function SheetFieldCell({ field }: { field: SheetField }) {
  const Icon = field.icon;
  return (
    <div className="rounded-2xl border border-blue-100 px-3 pb-2.5 pt-2">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{field.label}</p>
      <p className="mt-1 flex items-center gap-2 text-sm font-medium text-gray-900">
        <Icon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
        <span className="truncate">{field.value}</span>
      </p>
    </div>
  );
}

function SheetMeta({ apartment }: { apartment: Apartment }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <MetaCard icon={Calendar} label="Deal date" value={formatSheetDate(apartment.dealDate)} />
      <MetaCard icon={Tag} label="Sales type" value={sheetSalesLabel(apartment)} />
    </div>
  );
}

function MetaCard({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-blue-100 px-4 py-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50 text-yellow-800">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="truncate text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
