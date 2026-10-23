'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Link2, Box } from 'lucide-react';
import { formatAmd } from '@/lib/formatAmd';
import { getEmbedPreviewUrl } from '@/lib/getEmbedPreviewUrl';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { APARTMENT_STATUS_OPTIONS } from './apartmentStatusOptions';
import { InReviewBadge } from './InReviewBadge';
import type { ApartmentListRow } from './apartmentListTypes';
import { activeReview, isLockedByOther } from '@/lib/inReview';

export type ApartmentCardItemProps = {
  apt: ApartmentListRow;
  onStatusChange: (id: number, status: string) => void;
  getStatusColor: (status: string) => string;
  onOpenPreview: (url: string) => void;
  onLandingCopied?: () => void;
  currentUserId?: string;
};

export const ApartmentCardItem = memo(
  ({
    apt,
    onStatusChange,
    getStatusColor,
    onOpenPreview,
    onLandingCopied,
    currentUserId,
  }: ApartmentCardItemProps) => {
    const router = useRouter();
    const [landingCopying, setLandingCopying] = useState(false);
    const [landingJustCopied, setLandingJustCopied] = useState(false);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const matterUrl = apt.matter_link ?? apt.matterLink ?? null;
    const review = activeReview(apt.in_review);
    const statusLocked = isLockedByOther(review, currentUserId);
    const embedUrl = matterUrl ? getEmbedPreviewUrl(matterUrl) : null;

    const handleCardClick = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-no-nav]')) return;
      router.push(`/apartments/${apt.id}`);
    };

    const handleLandingCopy = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (landingCopying) return;
      setLandingCopying(true);
      try {
        const res = await fetch(`/api/apartments/${apt.id}/landing`, {
          method: 'POST',
        });
        if (!res.ok) throw new Error('Failed');
        const { url } = await res.json();
        await navigator.clipboard.writeText(url);
        setLandingJustCopied(true);
        onLandingCopied?.();
        setTimeout(() => setLandingJustCopied(false), 2000);
      } catch {
        alert('Failed to copy landing link');
      } finally {
        setLandingCopying(false);
      }
    };

    const handlePreviewClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (embedUrl) onOpenPreview(embedUrl);
    };

    return (
      <article
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            router.push(`/apartments/${apt.id}`);
          }
        }}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-blue-100/80 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg ${statusMenuOpen ? 'z-30' : ''}`}
      >
        <span aria-hidden className="brand-stripe absolute inset-x-0 top-0 h-1" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-gray-900">
              {apt.apartmentNo}
            </h3>
            <p className="mt-0.5 truncate text-sm text-gray-500">
              {apt.building.district.name} — {apt.building.name}
            </p>
            {review ? <InReviewBadge email={review.email} /> : null}
          </div>
          <div data-no-nav className="shrink-0">
            <DropdownSelect
              value={apt.status}
              disabled={statusLocked}
              onChange={(next) => onStatusChange(apt.id, next)}
              options={APARTMENT_STATUS_OPTIONS}
              placeholder="Status"
              ariaLabel="Apartment status"
              align="end"
              fullWidth={false}
              onOpenChange={setStatusMenuOpen}
              triggerClassName={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${getStatusColor(apt.status)}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Area</span>
            <span className="tabular-nums font-medium text-gray-900">
              {apt.sqm ? `${apt.sqm} m²` : '—'}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Price</span>
            <span className="tabular-nums font-semibold text-gray-900">
              {apt.total_price ? formatAmd(apt.total_price) : '—'}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Paid</span>
            <span className="tabular-nums font-medium text-gray-900">
              {apt.total_paid ? formatAmd(apt.total_paid) : '—'}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-gray-500">Balance</span>
            <span className="tabular-nums font-medium text-gray-900">
              {apt.balance ? formatAmd(apt.balance) : '—'}
            </span>
          </div>
        </div>

        <div
          className="mt-4 flex items-stretch gap-3 border-t border-gray-100 pt-4"
          data-no-nav
        >
          <Link
            href={`/apartments/${apt.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Eye className="h-4 w-4 shrink-0" />
            <span className="truncate">View Details</span>
          </Link>
          <button
            type="button"
            onClick={handleLandingCopy}
            disabled={landingCopying}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-100 px-4 py-2.5 text-sm font-semibold text-yellow-800 transition-colors hover:bg-yellow-200 disabled:opacity-60"
            title="Copy landing link"
          >
            <Link2 className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {landingCopying ? '…' : landingJustCopied ? 'Copied!' : 'Landing'}
            </span>
          </button>
          {embedUrl && (
            <button
              type="button"
              onClick={handlePreviewClick}
              className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
              title="Open 3D preview"
            >
              <Box className="h-4 w-4 shrink-0" />
              <span className="truncate">3D Preview</span>
            </button>
          )}
        </div>
      </article>
    );
  }
);

ApartmentCardItem.displayName = 'ApartmentCardItem';
