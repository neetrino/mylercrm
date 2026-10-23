'use client';

import { Search, X } from 'lucide-react';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { APARTMENT_STATUS_OPTIONS } from './apartmentStatusOptions';

type BuildingOption = {
  id: number;
  name: string;
  district: { name: string };
};

type ApartmentsFiltersProps = {
  searchInput: string;
  onSearchChange: (value: string) => void;
  buildings: BuildingOption[];
  selectedBuilding: number | null;
  onBuildingChange: (id: number | null) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
};

const FIELD_LABEL = 'mb-1.5 block text-sm font-medium text-gray-700';

export function ApartmentsFilters({
  searchInput,
  onSearchChange,
  buildings,
  selectedBuilding,
  onBuildingChange,
  selectedStatus,
  onStatusChange,
}: ApartmentsFiltersProps) {
  const buildingOptions = buildings.map((building) => ({
    value: String(building.id),
    label: `${building.district.name} — ${building.name}`,
  }));

  return (
    <div className="card relative z-20 grid grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(240px,1.35fr)_1fr_1fr]">
      <SearchField value={searchInput} onChange={onSearchChange} />
      <div className="min-w-0">
        <label htmlFor="apartments-building" className={FIELD_LABEL}>
          Building
        </label>
        <DropdownSelect
          id="apartments-building"
          value={selectedBuilding ? String(selectedBuilding) : ''}
          onChange={(next) => onBuildingChange(next ? Number(next) : null)}
          options={[{ value: '', label: 'All Buildings' }, ...buildingOptions]}
          placeholder="All Buildings"
          ariaLabel="Filter by building"
        />
      </div>
      <div className="min-w-0">
        <label htmlFor="apartments-status" className={FIELD_LABEL}>
          Status
        </label>
        <DropdownSelect
          id="apartments-status"
          value={selectedStatus}
          onChange={onStatusChange}
          options={[{ value: '', label: 'All Statuses' }, ...APARTMENT_STATUS_OPTIONS]}
          placeholder="All Statuses"
          ariaLabel="Filter by status"
        />
      </div>
    </div>
  );
}

function SearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor="apartments-search" className={FIELD_LABEL}>
        Search
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
        <input
          id="apartments-search"
          type="search"
          value={value}
          placeholder="No., building, district, owner..."
          onChange={(event) => onChange(event.target.value)}
          aria-label="Search apartments"
          className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
