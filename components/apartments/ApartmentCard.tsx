'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { ApartmentCardChrome } from './ApartmentCardChrome';
import { ApartmentDealSection } from './ApartmentDealSection';
import { ApartmentLinksSection } from './ApartmentLinksSection';
import { ApartmentOverviewSection } from './ApartmentOverviewSection';
import { ApartmentPreviewModal } from './ApartmentPreviewModal';
import { buildApartmentUpdateInput, type Apartment } from './apartmentCardModel';

interface ApartmentCardProps {
  apartmentId: number;
}

export default function ApartmentCard({ apartmentId }: ApartmentCardProps) {
  const router = useRouter();
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'links'>('overview');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Apartment>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOriginalUrl, setPreviewOriginalUrl] = useState<string | null>(null);
  const [landingCopied, setLandingCopied] = useState(false);

  useEffect(() => {
    // При загрузке страницы всегда обновляем без кэша для получения актуальных данных
    fetchApartment(true, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apartmentId]);

  const fetchApartment = async (skipCache = false, showLoading = true) => {
    try {
      // При обновлении после загрузки файла не используем кэш
      // Добавляем timestamp к URL для обхода кэша
      const url = skipCache 
        ? `/api/apartments/${apartmentId}?t=${Date.now()}`
        : `/api/apartments/${apartmentId}`;
      
      if (showLoading) {
        setLoading(true);
      }
      const response = await fetch(url, {
        cache: skipCache ? 'no-store' : 'default',
      });
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/apartments');
          return;
        }
        throw new Error('Failed to load apartment');
      }
      const data = await response.json();
      setApartment(data);
      setFormData(data);
    } catch (err) {
      setError('Failed to load apartment');
      console.error(err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Функция для обновления после загрузки файла (без кэша)
  const refreshAfterUpload = async () => {
    await fetchApartment(true);
  };

  const handleSave = async () => {
    try {
      const apiData = buildApartmentUpdateInput(formData);
      const response = await fetch(`/api/apartments/${apartmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessages = (errorData.details as z.ZodIssue[])
            .map((err) => `${err.path.join('.')}: ${err.message}`)
            .join(', ');
          throw new Error(`Validation error: ${errorMessages}`);
        }
        throw new Error(errorData.error || 'Failed to save');
      }

      const updated = await response.json();
      setApartment(updated);
      setFormData(updated);
      setEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save changes');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    // Оптимистичное обновление UI - сразу обновляем статус
    const previousStatus = apartment?.status;
    setApartment((prev) => (prev ? { ...prev, status: newStatus } : prev));

    // Делаем запрос асинхронно без блокировки UI
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/apartments/${apartmentId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) throw new Error('Failed to update status');

        const updated = await response.json();
        // Обновляем статус из ответа сервера
        setApartment((prev) => (prev ? { ...prev, status: updated.status.toUpperCase() } : prev));
        
        // Обновляем данные с сервера в фоне (не блокируя UI)
        if ('requestIdleCallback' in window) {
          requestIdleCallback(async () => {
            try {
              const url = `/api/apartments/${apartmentId}?t=${Date.now()}`;
              const refreshResponse = await fetch(url, {
                cache: 'no-store',
              });
              if (refreshResponse.ok) {
                const refreshedData = await refreshResponse.json();
                setApartment(refreshedData);
                setFormData(refreshedData);
              }
            } catch (refreshErr) {
              console.error('Refresh error:', refreshErr);
            }
          });
        } else {
          setTimeout(async () => {
            try {
              const url = `/api/apartments/${apartmentId}?t=${Date.now()}`;
              const refreshResponse = await fetch(url, {
                cache: 'no-store',
              });
              if (refreshResponse.ok) {
                const refreshedData = await refreshResponse.json();
                setApartment(refreshedData);
                setFormData(refreshedData);
              }
            } catch (refreshErr) {
              console.error('Refresh error:', refreshErr);
            }
          }, 100);
        }
      } catch (err) {
        console.error('Status update error:', err);
        // Откатываем оптимистичное обновление при ошибке
        setApartment((prev) => (prev ? { ...prev, status: previousStatus || 'UPCOMING' } : prev));
        alert('Failed to update status');
      }
    }, 0);
  };


  const handleCopyLandingLink = async () => {
    try {
      const res = await fetch(`/api/apartments/${apartmentId}/landing`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed');
      const { url } = await res.json();
      await navigator.clipboard.writeText(url);
      setLandingCopied(true);
      setTimeout(() => setLandingCopied(false), 2000);
    } catch {
      alert('Failed to copy landing link');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-sm text-gray-600">Loading apartment...</p>
        </div>
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{error || 'Apartment not found'}</p>
        <Link href="/apartments" className="mt-2 text-sm text-blue-600 hover:underline">
          ← Back to list
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <ApartmentCardChrome
        apartment={apartment}
        editing={editing}
        setFormData={setFormData}
        handleCopyLandingLink={handleCopyLandingLink}
        landingCopied={landingCopied}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setEditing={setEditing}
        handleSave={handleSave}
        handleStatusChange={handleStatusChange}
      />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <ApartmentOverviewSection
            apartment={apartment}
            editing={editing}
            formData={formData}
            setFormData={setFormData}
          />
          <ApartmentDealSection
            apartment={apartment}
            editing={editing}
            formData={formData}
            setFormData={setFormData}
            apartmentId={apartmentId}
            refreshAfterUpload={refreshAfterUpload}
          />
        </div>
      )}

      {activeTab === 'links' && (
        <div className="space-y-6">
          {/* Links Section */}
          <ApartmentLinksSection
            apartment={apartment}
            editing={editing}
            formData={formData}
            setFormData={setFormData}
            apartmentId={apartmentId}
            refreshAfterUpload={refreshAfterUpload}
            setPreviewUrl={setPreviewUrl}
            setPreviewOriginalUrl={setPreviewOriginalUrl}
          />
        </div>
      )}

      <ApartmentPreviewModal
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
        previewOriginalUrl={previewOriginalUrl}
        setPreviewOriginalUrl={setPreviewOriginalUrl}
      />
    </div>
  );
}
