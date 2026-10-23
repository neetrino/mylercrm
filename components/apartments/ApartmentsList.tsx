'use client';

import { useRef } from 'react';
import { Building2, FileSpreadsheet, LayoutGrid, List as ListIcon } from 'lucide-react';
import ApartmentForm from './ApartmentForm';
import { ApartmentCardItem } from './ApartmentCardItem';
import { ApartmentsBulkBar } from './ApartmentsBulkBar';
import { ApartmentsFilters } from './ApartmentsFilters';
import { ApartmentsFloorView } from './ApartmentsFloorView';
import { ApartmentsPagination } from './ApartmentsPagination';
import { ApartmentsPreviewModal } from './ApartmentsPreviewModal';
import { ApartmentsTable } from './ApartmentsTable';
import { ViewModeButton } from './ViewModeButton';
import { useApartmentsBulk } from './useApartmentsBulk';
import { useApartmentsCatalog } from './useApartmentsCatalog';

export default function ApartmentsList() {
  const bulkResetRef = useRef<(() => void) | null>(null);
  const catalog = useApartmentsCatalog(bulkResetRef);
  const bulk = useApartmentsBulk({
    apartments: catalog.apartments,
    setApartments: catalog.setApartments,
    setError: catalog.setError,
    setPagination: catalog.setPagination,
    sortBy: catalog.sortBy,
    sortOrder: catalog.sortOrder,
    selectedBuilding: catalog.selectedBuilding,
    selectedStatus: catalog.selectedStatus,
    searchQuery: catalog.searchQuery,
  });
  bulkResetRef.current = bulk.reset;

  const {
    apartments,
    buildings,
    loading,
    error,
    selectedBuilding,
    setSelectedBuilding,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    searchInput,
    setSearchInput,
    showForm,
    setShowForm,
    currentPage,
    setCurrentPage,
    viewMode,
    setViewMode,
    sortBy,
    sortOrder,
    pagination,
    previewModalUrl,
    setPreviewModalUrl,
    exportLoading,
    isAdmin,
    handleExportExcel,
    fetchApartments,
    handleSort,
    handleStatusChange,
    getStatusColor,
  } = catalog;
  const {
    loadingAll,
    allLoaded,
    editedFields,
    bulkSaving,
    bulkSaveResult,
    listBulkEditMode,
    setListBulkEditMode,
    hasEdits,
    exitListBulkEdit,
    handleFieldEdit,
    handleBulkSave,
    handleLoadAll,
  } = bulk;

  if (loading && apartments.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-sm text-gray-600">Loading apartments...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Apartments</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and view all apartments
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View mode toggle */}
            <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
              <ViewModeButton
                active={viewMode === 'grid'}
                label="Grid view"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </ViewModeButton>
              <ViewModeButton
                active={viewMode === 'list'}
                label="List view"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="h-4 w-4" />
              </ViewModeButton>
              <ViewModeButton
                active={viewMode === 'floor'}
                label="Floor view"
                onClick={() => setViewMode('floor')}
              >
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
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="btn-primary h-10 rounded-xl shadow-sm"
                >
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

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {showForm && (
        <ApartmentForm
          buildings={buildings}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchApartments(currentPage);
          }}
        />
      )}

      <ApartmentsBulkBar
        viewMode={viewMode}
        loadingAll={loadingAll}
        allLoaded={allLoaded}
        apartments={apartments}
        pagination={pagination}
        handleLoadAll={handleLoadAll}
        listBulkEditMode={listBulkEditMode}
        setListBulkEditMode={setListBulkEditMode}
        exitListBulkEdit={exitListBulkEdit}
        hasEdits={hasEdits}
        editedFields={editedFields}
        handleBulkSave={handleBulkSave}
        bulkSaving={bulkSaving}
        bulkSaveResult={bulkSaveResult}
      />
      {/* Loading all overlay */}
      {loadingAll && (
        <div className="mb-4 overflow-hidden rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-indigo-50">
          <div className="relative h-1.5 w-full overflow-hidden bg-indigo-100">
            <div className="absolute inset-0 animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-indigo-100 via-indigo-400 to-indigo-100" />
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="relative">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-900">Loading all apartments…</p>
              <p className="text-xs text-indigo-500">This may take a moment for large datasets</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <p className="mb-4 text-sm text-gray-500">
        {allLoaded ? (
          <>
            Showing all{' '}
            <span className="font-medium text-gray-800">{apartments.length}</span>{' '}
            apartments
          </>
        ) : (
          <>
            Showing{' '}
            <span className="font-medium text-gray-800">
              {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
              –
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium text-gray-800">{pagination.total}</span>{' '}
            apartments
          </>
        )}
      </p>

      {/* Empty state */}
      {apartments.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">
            {searchQuery.trim()
              ? 'No apartments match your search. Try different keywords or clear the search.'
              : 'No apartments found. Create the first apartment.'}
          </p>
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearchQuery(''); }}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : viewMode === 'floor' ? (
        <ApartmentsFloorView
          apartments={apartments}
          buildings={buildings}
          isAdmin={isAdmin}
          handleStatusChange={handleStatusChange}
          getStatusColor={getStatusColor}
          setPreviewModalUrl={setPreviewModalUrl}
        />
      ) : viewMode === 'grid' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apartments.map((apt) => (
            <ApartmentCardItem
              key={apt.id}
              apt={apt}
              onStatusChange={handleStatusChange}
              getStatusColor={getStatusColor}
              onOpenPreview={setPreviewModalUrl}
            />
          ))}
        </div>
      ) : (
        <ApartmentsTable
          apartments={apartments}
          editedFields={editedFields}
          listBulkEditMode={listBulkEditMode}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          handleFieldEdit={handleFieldEdit}
          handleStatusChange={handleStatusChange}
          getStatusColor={getStatusColor}
        />
      )}

      <ApartmentsPagination
        pagination={pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        allLoaded={allLoaded}
      />
      <ApartmentsPreviewModal
        previewModalUrl={previewModalUrl}
        setPreviewModalUrl={setPreviewModalUrl}
      />
    </div>
  );
}
