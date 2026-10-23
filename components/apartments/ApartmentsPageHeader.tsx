'use client';

import { Building2, FileSpreadsheet, LayoutGrid, List as ListIcon } from 'lucide-react';
import type { Building, District } from '@prisma/client';
import { ApartmentsFilters } from './ApartmentsFilters';
import { ViewModeButton } from './ViewModeButton';

type ApartmentsPageHeaderProps = {
  viewMode: 'grid' | 'list' | 'floor';
  setViewMode: (mode: 'grid' | 'list' | 'floor') => void;
  isAdmin: boolean;
  exportLoading: boolean;
  handleExportExcel: () => void;
  setShowForm: (open: boolean) => void;
  searchInput: string;
  setSearchInput: (value: string) => void;
  buildings: (Building & { district: District })[];
  selectedBuilding: number | null;
  setSelectedBuilding: (id: number | null) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
};

export function ApartmentsPageHeader(props: ApartmentsPageHeaderProps) {
  const {
    viewMode,
    setViewMode,
    isAdmin,
    exportLoading,
    handleExportExcel,
    setShowForm,
    searchInput,
    setSearchInput,
    buildings,
    selectedBuilding,
    setSelectedBuilding,
    selectedStatus,
    setSelectedStatus,
  } = props;

  return (
    <div className="mb-6">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="page-kicker">Portfolio</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">Apartments</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and view all apartments</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <ViewModeButton active={viewMode === 'grid'} label="Grid view" onClick={() => setViewMode('grid')}>
              <LayoutGrid className="h-4 w-4" />
            </ViewModeButton>
            <ViewModeButton active={viewMode === 'list'} label="List view" onClick={() => setViewMode('list')}>
              <ListIcon className="h-4 w-4" />
            </ViewModeButton>
            <ViewModeButton active={viewMode === 'floor'} label="Floor view" onClick={() => setViewMode('floor')}>
              <Building2 className="h-4 w-4" />
            </ViewModeButton>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handleExportExcel()}
                disabled={exportLoading}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                title="Download all apartments as Excel"
              >
                <FileSpreadsheet className="h-4 w-4 shrink-0" />
                {exportLoading ? 'Exporting…' : 'Export Excel'}
              </button>
              <button type="button" onClick={() => setShowForm(true)} className="btn-primary h-10 rounded-xl shadow-sm">
                + Create Apartment
              </button>
            </div>
          )}
        </div>
      </div>
      <ApartmentsFilters
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        buildings={buildings}
        selectedBuilding={selectedBuilding}
        onBuildingChange={setSelectedBuilding}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />
    </div>
  );
}
