'use client';

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { useSession } from 'next-auth/react';
import type { Building, District } from '@prisma/client';
import type { ApartmentListRow } from './apartmentListTypes';
import { useReviewListPoll } from './useReviewListPoll';

const APARTMENTS_VIEW_MODE_KEY = 'maylercrm:apartmentsViewMode';

export function useApartmentsCatalog(
  bulkResetRef: MutableRefObject<(() => void) | null>,
) {
  const { data: session } = useSession();
  const [apartments, setApartments] = useState<ApartmentListRow[]>([]);
  const [buildings, setBuildings] = useState<(Building & { district: District })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'floor'>('grid');
  const skipPersistViewModeOnce = useRef(true);
  const [sortBy, setSortBy] = useState<string>('apartmentNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 21,
    total: 0,
    total_pages: 0,
  });
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const isAdmin = session?.user?.role === 'ADMIN';

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const response = await fetch('/api/admin/apartments/export');
      if (!response.ok) {
        if (response.status === 403) {
          alert('Access denied');
        } else {
          alert('Export failed');
        }
        return;
      }
      const blob = await response.blob();
      const cd = response.headers.get('Content-Disposition');
      let filename = 'apartments-export.xlsx';
      const match = cd?.match(/filename="([^"]+)"/);
      if (match) filename = match[1];
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await fetch('/api/buildings');
      if (response.ok) {
        const data = await response.json();
        setBuildings(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApartments = useCallback(async (page: number = 1, silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        bulkResetRef.current?.();
      }
      let url = `/api/apartments?page=${page}&limit=21&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      if (selectedBuilding) {
        url += `&buildingId=${selectedBuilding}`;
      }
      if (selectedStatus) {
        url += `&status=${selectedStatus}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load');
      const data = await response.json();
      setApartments(data.items || []);
      setPagination(data.pagination || { page: 1, limit: 21, total: 0, total_pages: 0 });
    } catch (err) {
      if (!silent) {
        setError('Failed to load apartments');
        console.error(err);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [sortBy, sortOrder, selectedBuilding, selectedStatus, searchQuery, bulkResetRef]);
  useReviewListPoll(fetchApartments, currentPage);
  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(APARTMENTS_VIEW_MODE_KEY);
      if (raw === 'grid' || raw === 'list' || raw === 'floor') {
        setViewMode(raw);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (skipPersistViewModeOnce.current) {
      skipPersistViewModeOnce.current = false;
      return;
    }
    try {
      localStorage.setItem(APARTMENTS_VIEW_MODE_KEY, viewMode);
    } catch {
      /* ignore */
    }
  }, [viewMode]);

  // Debounce поиска: обновляем searchQuery через 300ms после последнего ввода
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // При смене фильтров сбрасываем на первую страницу
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBuilding, selectedStatus, searchQuery, sortBy, sortOrder]);

  // Один запрос списка: при загрузке и при смене страницы/фильтров (без двойного вызова при монтировании)
  useEffect(() => {
    fetchApartments(currentPage);
  }, [currentPage, selectedBuilding, selectedStatus, searchQuery, sortBy, sortOrder, fetchApartments]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Переключаем порядок сортировки
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Устанавливаем новое поле сортировки
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Сбрасываем на первую страницу при изменении сортировки
  };

  const handleStatusChange = useCallback(async (id: number, newStatus: string) => {
    // Оптимистичное обновление UI - сразу обновляем статус в списке
    setApartments((prevApartments) =>
      prevApartments.map((apt) =>
        apt.id === id ? { ...apt, status: newStatus } : apt
      )
    );

    // Делаем запрос асинхронно без блокировки UI
    // Используем setTimeout для неблокирующего выполнения
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/apartments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          const message = typeof body.error === 'string' ? body.error : 'Failed to update status';
          throw new Error(message);
        }

        // Обновляем только текущую страницу в фоне (не блокируя UI)
        // Используем requestIdleCallback если доступен, иначе setTimeout
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            fetchApartments(currentPage);
          });
        } else {
          setTimeout(() => {
            fetchApartments(currentPage);
          }, 100);
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to update status');
        void fetchApartments(currentPage);
      }
    }, 0);
  }, [currentPage, fetchApartments]);

  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'available':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'reserved':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'sold':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }, []);

  return {
    apartments,
    setApartments,
    buildings,
    loading,
    error,
    setError,
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
    setPagination,
    previewModalUrl,
    setPreviewModalUrl,
    exportLoading,
    isAdmin,
    currentUserId: session?.user?.id ?? '',
    handleExportExcel,
    fetchApartments,
    handleSort,
    handleStatusChange,
    getStatusColor,
  };
}
