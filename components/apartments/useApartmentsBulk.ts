'use client';

import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type { ApartmentListRow, EditedFields } from './apartmentListTypes';

type Pagination = { page: number; limit: number; total: number; total_pages: number };

type UseApartmentsBulkArgs = {
  apartments: ApartmentListRow[];
  setApartments: Dispatch<SetStateAction<ApartmentListRow[]>>;
  setError: Dispatch<SetStateAction<string>>;
  setPagination: Dispatch<SetStateAction<Pagination>>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedBuilding: number | null;
  selectedStatus: string;
  searchQuery: string;
};

export function useApartmentsBulk(args: UseApartmentsBulkArgs) {
  const {
    apartments,
    setApartments,
    setError,
    setPagination,
    sortBy,
    sortOrder,
    selectedBuilding,
    selectedStatus,
    searchQuery,
  } = args;

  const [loadingAll, setLoadingAll] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [editedFields, setEditedFields] = useState<EditedFields>({});
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkSaveResult, setBulkSaveResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [listBulkEditMode, setListBulkEditMode] = useState(false);

  const hasEdits = useMemo(() => Object.keys(editedFields).length > 0, [editedFields]);

  const exitListBulkEdit = useCallback(() => {
    if (hasEdits) {
      const ok = window.confirm(
        'Discard unsaved changes to apartment number and name fields?'
      );
      if (!ok) return;
    }
    setEditedFields({});
    setListBulkEditMode(false);
  }, [hasEdits]);

  const handleFieldEdit = useCallback((id: number, field: 'apartmentNo' | 'apartmentName', value: string) => {
    const apt = apartments.find((a) => a.id === id);
    if (!apt) return;

    const original = field === 'apartmentNo' ? apt.apartmentNo : (apt.apartmentName ?? '');
    const normalizedValue = value;
    const normalizedOriginal = original;

    setEditedFields((prev) => {
      const current = { ...prev };
      if (!current[id]) {
        current[id] = {};
      }
      if (normalizedValue === normalizedOriginal) {
        delete current[id][field];
        if (Object.keys(current[id]).length === 0) {
          delete current[id];
        }
      } else if (field === 'apartmentName') {
        current[id].apartmentName = value === '' ? null : value;
      } else {
        current[id].apartmentNo = value;
      }
      return current;
    });
  }, [apartments]);

  const handleBulkSave = useCallback(async () => {
    if (!hasEdits) return;
    setBulkSaving(true);
    setBulkSaveResult(null);

    const items = Object.entries(editedFields).map(([idStr, fields]) => ({
      id: Number(idStr),
      ...fields,
    }));

    try {
      const response = await fetch('/api/apartments/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Save failed' }));
        throw new Error(err.error || 'Save failed');
      }

      const result = await response.json();

      setApartments((prev) =>
        prev.map((apt) => {
          const edits = editedFields[apt.id];
          if (!edits) return apt;
          return {
            ...apt,
            apartmentNo: edits.apartmentNo ?? apt.apartmentNo,
            apartmentName: edits.apartmentName !== undefined ? edits.apartmentName ?? null : apt.apartmentName,
          };
        })
      );
      setEditedFields({});
      setListBulkEditMode(false);
      setBulkSaveResult({ type: 'success', message: `${result.updated} apartments updated` });
      setTimeout(() => setBulkSaveResult(null), 3000);
    } catch (err) {
      setBulkSaveResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Save failed',
      });
    } finally {
      setBulkSaving(false);
    }
  }, [editedFields, hasEdits, setApartments]);

  const handleLoadAll = useCallback(async () => {
    setLoadingAll(true);
    setAllLoaded(false);

    try {
      let allApartments: ApartmentListRow[] = [];
      let page = 1;
      let totalPages = 1;
      const limit = 100;

      while (page <= totalPages) {
        let url = `/api/apartments?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
        if (selectedBuilding) url += `&buildingId=${selectedBuilding}`;
        if (selectedStatus) url += `&status=${selectedStatus}`;
        if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load');
        const data = await response.json();

        allApartments = [...allApartments, ...(data.items || [])];
        totalPages = data.pagination?.total_pages || 1;
        page++;
      }

      setApartments(allApartments);
      setPagination({
        page: 1,
        limit: allApartments.length,
        total: allApartments.length,
        total_pages: 1,
      });
      setAllLoaded(true);
      setEditedFields({});
      setListBulkEditMode(false);
    } catch (err) {
      setError('Failed to load all apartments');
      console.error(err);
    } finally {
      setLoadingAll(false);
    }
  }, [sortBy, sortOrder, selectedBuilding, selectedStatus, searchQuery, setApartments, setError, setPagination]);

  const reset = useCallback(() => {
    setAllLoaded(false);
    setEditedFields({});
    setListBulkEditMode(false);
  }, []);

  return {
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
    reset,
  };
}
