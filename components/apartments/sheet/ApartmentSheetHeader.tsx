'use client';

import { X } from 'lucide-react';
import { InReviewBadge } from '../InReviewBadge';
import type { Apartment } from '../apartmentCardModel';
import { apartmentSheetSubtitle, apartmentSheetTitle } from './apartmentSheetModel';

type ApartmentSheetHeaderProps = {
  apartment: Apartment;
  editing: boolean;
  landingCopied: boolean;
  reviewEmail: string | null;
  onCopyLanding: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onClose?: () => void;
};

const primaryButton =
  'inline-flex items-center rounded-full bg-blue-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-blue-900';
const ghostButton =
  'inline-flex items-center rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-900 hover:bg-blue-50';

export function ApartmentSheetHeader(props: ApartmentSheetHeaderProps) {
  const { apartment, reviewEmail, onClose } = props;
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="truncate text-3xl font-semibold tracking-tight text-gray-900">{apartmentSheetTitle(apartment)}</h2>
        <p className="mt-1 truncate text-sm text-gray-500">{apartmentSheetSubtitle(apartment)}</p>
        {reviewEmail ? <div className="mt-2"><InReviewBadge email={reviewEmail} /></div> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <SheetActions {...props} />
        {onClose ? (
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-blue-50">
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SheetActions(props: ApartmentSheetHeaderProps) {
  if (props.editing) {
    return (
      <>
        <button type="button" onClick={props.onSave} className={primaryButton}>Save</button>
        <button type="button" onClick={props.onCancel} className={ghostButton}>Cancel</button>
      </>
    );
  }
  return (
    <>
      <button type="button" onClick={props.onCopyLanding} className={primaryButton}>
        {props.landingCopied ? 'Copied' : 'Landing link'}
      </button>
      <button type="button" onClick={props.onEdit} className={ghostButton}>Edit</button>
    </>
  );
}
