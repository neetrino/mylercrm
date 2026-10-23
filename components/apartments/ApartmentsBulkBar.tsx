'use client';

import { AlertCircle, CheckCircle2, Layers, Loader2, Save, SquarePen, X } from 'lucide-react';
import type { EditedFields } from './apartmentListTypes';

type ApartmentsBulkBarProps = {
  viewMode: 'grid' | 'list' | 'floor';
  loadingAll: boolean;
  allLoaded: boolean;
  apartments: { length: number };
  pagination: { total: number };
  handleLoadAll: () => void;
  listBulkEditMode: boolean;
  setListBulkEditMode: (value: boolean) => void;
  exitListBulkEdit: () => void;
  hasEdits: boolean;
  editedFields: EditedFields;
  handleBulkSave: () => void;
  bulkSaving: boolean;
  bulkSaveResult: { type: 'success' | 'error'; message: string } | null;
};

export function ApartmentsBulkBar(props: ApartmentsBulkBarProps) {
  const {
    viewMode,
    loadingAll,
    allLoaded,
    apartments,
    pagination,
    handleLoadAll,
    listBulkEditMode,
    setListBulkEditMode,
    exitListBulkEdit,
    hasEdits,
    editedFields,
    handleBulkSave,
    bulkSaving,
    bulkSaveResult,
  } = props;
  return (
    <>
      {/* Bulk actions bar */}
      {viewMode === 'list' && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleLoadAll()}
            disabled={loadingAll}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
            title={
              loadingAll
                ? 'Loading all apartments…'
                : allLoaded
                  ? `All ${apartments.length} apartments loaded`
                  : `Show all ${pagination.total} apartments (load full list)`
            }
            aria-label={
              loadingAll
                ? 'Loading all apartments'
                : allLoaded
                  ? `All ${apartments.length} apartments loaded`
                  : `Load all ${pagination.total} apartments`
            }
          >
            {loadingAll ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : allLoaded ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
            ) : (
              <Layers className="h-5 w-5" aria-hidden />
            )}
          </button>

          {!listBulkEditMode ? (
            <button
              type="button"
              onClick={() => setListBulkEditMode(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50"
            >
              <SquarePen className="h-4 w-4 shrink-0" />
              Bulk edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={exitListBulkEdit}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50"
              >
                <X className="h-4 w-4 shrink-0" />
                Exit edit
              </button>
              {hasEdits && (
                <button
                  type="button"
                  onClick={() => void handleBulkSave()}
                  disabled={bulkSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bulkSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {bulkSaving ? 'Saving…' : `Save changes (${Object.keys(editedFields).length})`}
                </button>
              )}
            </>
          )}

          {bulkSaveResult && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-opacity ${
                bulkSaveResult.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {bulkSaveResult.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              {bulkSaveResult.message}
            </span>
          )}
        </div>
      )}
    </>
  );
}
