'use client';

import { useEffect, useState } from 'react';
import ImageLightbox from '@/components/ui/ImageLightbox';
import { formatAmd } from '@/lib/formatAmd';
import { LandingSections } from './LandingSections';
import type { LandingApartment } from './landingTypes';

export default function LandingView({ token }: { token: string }) {
  const [apartment, setApartment] = useState<LandingApartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/landing/${encodeURIComponent(token)}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          if (res.status === 404) setError('Not found');
          else setError('Failed to load');
          return;
        }
        const data = await res.json();
        if (!cancelled) setApartment(data);
      } catch {
        if (!cancelled) setError('Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'UPCOMING': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'AVAILABLE': return 'bg-green-50 text-green-700 border-green-200';
      case 'RESERVED': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'SOLD': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'UPCOMING': return 'Upcoming';
      case 'AVAILABLE': return 'Available';
      case 'RESERVED': return 'Reserved';
      case 'SOLD': return 'Sold';
      default: return status || '-';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-medium text-red-800">{error || 'Not found'}</p>
          <p className="mt-2 text-sm text-red-600">This link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const attachments = apartment.attachments || [];
  const agreementFiles = attachments.filter((a) => a.fileType === 'AGREEMENT');
  const progressImages = attachments.filter((a) => a.fileType === 'PROGRESS_IMAGE');
  const floorplans = attachments.filter((a) => a.fileType === 'FLOORPLAN');
  const images = attachments.filter((a) => a.fileType === 'IMAGE');

  const threeDSections = [
    { label: '3D Tour', url: apartment.matterLink },
    { label: 'Exterior', url: apartment.exteriorLink },
    { label: 'Exterior 2', url: apartment.exteriorLink2 },
  ].filter((x) => x.url);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const infoRows = [
    apartment.ownershipName && { icon: 'person', label: 'Owner', value: apartment.ownershipName },
    { icon: 'area', label: 'Area', value: apartment.sqm ? `${apartment.sqm} sq/m` : '—' },
    { icon: 'floor', label: 'Floor', value: apartment.floor != null ? String(apartment.floor) : '—' },
    { icon: 'price', label: 'Total price', value: apartment.total_price ? formatAmd(apartment.total_price) : '—' },
    { icon: 'price2', label: 'Price per m²', value: apartment.price_sqm ? formatAmd(apartment.price_sqm) : '—' },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero — modern strip */}
        <header className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 px-6 py-10 shadow-xl sm:px-10 lg:py-12">
          <div className="relative z-10">
            <p className="text-sm font-medium uppercase tracking-widest text-slate-300">
              {apartment.district_name} · {apartment.building_name}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Apartment {apartment.apartmentNo}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(apartment.status)}`}
              >
                {getStatusLabel(apartment.status)}
              </span>
              {apartment.total_price && (
                <span className="text-lg font-semibold text-white">
                  {formatAmd(apartment.total_price)}
                </span>
              )}
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent" />
        </header>

        {/* Section nav — horizontal anchor links */}
        <nav className="mb-8 flex flex-wrap gap-2 border-b border-slate-200/80 bg-white/80 py-3 px-4 rounded-xl backdrop-blur sm:gap-3 sm:px-5">
          <button type="button" onClick={() => scrollTo('information')} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
            Information
          </button>
          {agreementFiles.length > 0 && (
            <button type="button" onClick={() => scrollTo('legal')} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              Legal Documents
            </button>
          )}
          {floorplans.length > 0 && (
            <button type="button" onClick={() => scrollTo('floor-plans')} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              2D Floor Plans
            </button>
          )}
          {threeDSections.length > 0 && (
            <button type="button" onClick={() => scrollTo('3d')} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              3D Tours
            </button>
          )}
          {progressImages.length > 0 && (
            <button type="button" onClick={() => scrollTo('stages')} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              Stages
            </button>
          )}
          {images.length > 0 && (
            <button type="button" onClick={() => scrollTo('photos')} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              Photos
            </button>
          )}
        </nav>

        {/* Information — dark panel with icons (pro style) */}
        <LandingSections
          apartment={apartment}
          infoRows={infoRows}
          agreementFiles={agreementFiles}
          floorplans={floorplans}
          threeDSections={threeDSections}
          progressImages={progressImages}
          images={images}
          setLightbox={setLightbox}
        />
      </div>

      {lightbox && (
        <ImageLightbox
          urls={lightbox.urls}
          currentIndex={lightbox.index}
          onClose={() => setLightbox(null)}
          onPrev={lightbox.index > 0 ? () => setLightbox((p) => p && { ...p, index: p.index - 1 }) : undefined}
          onNext={lightbox.index < lightbox.urls.length - 1 ? () => setLightbox((p) => p && { ...p, index: p.index + 1 }) : undefined}
        />
      )}
    </div>
  );
}

