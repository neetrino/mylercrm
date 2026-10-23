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
            <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-gray-500">
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

        <div className="grid grid-cols-2 gap-3 border-t border-blue-50 pt-4">
          <CardStat label="Area" value={apt.sqm ? `${apt.sqm} m²` : '—'} />
          <CardStat label="Price" value={apt.total_price ? formatAmd(apt.total_price) : '—'} />
          <CardStat label="Paid" value={apt.total_paid ? formatAmd(apt.total_paid) : '—'} />
          <CardStat label="Balance" value={apt.balance ? formatAmd(apt.balance) : '—'} />
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-blue-50 pt-4" data-no-nav>
          <Link
            href={`/apartments/${apt.id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Eye className="h-4 w-4 shrink-0" />
            Open
          </Link>
          <button
            type="button"
            onClick={handleLandingCopy}
            disabled={landingCopying}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-800 transition-colors hover:bg-yellow-200 disabled:opacity-60"
            title={landingJustCopied ? 'Copied' : 'Copy landing link'}
            aria-label={landingJustCopied ? 'Landing link copied' : 'Copy landing link'}
          >
            <Link2 className="h-4 w-4" />
          </button>
          {embedUrl ? (
            <button
              type="button"
              onClick={handlePreviewClick}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 transition-colors hover:bg-green-100"
              title="Open 3D preview"
              aria-label="Open 3D preview"
            >
              <Box className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </article>
    );
  }
);

function CardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 text-xs font-semibold leading-4 tabular-nums text-gray-900">
        {value}
      </p>
    </div>
  );
}

ApartmentCardItem.displayName = 'ApartmentCardItem';
