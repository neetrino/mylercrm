'use client';

import { useState, type Dispatch, SetStateAction } from 'react';
import { activeReview, isLockedByOther } from '@/lib/inReview';
import type { Apartment } from '../apartmentCardModel';
import { ApartmentPreviewModal } from '../ApartmentPreviewModal';
import { ApartmentSheetHeader } from './ApartmentSheetHeader';
import { ApartmentSheetPanels } from './ApartmentSheetPanels';
import { ApartmentSheetTabs, type SheetTab } from './ApartmentSheetTabs';

type ApartmentSheetViewProps = {
  apartment: Apartment;
  apartmentId: number;
  currentUserId: string;
  currentUserEmail: string;
  blockedBy: string | null;
  holding: boolean;
  editing: boolean;
  formData: Partial<Apartment>;
  setFormData: Dispatch<SetStateAction<Partial<Apartment>>>;
  setEditing: (value: boolean) => void;
  onSave: () => void;
  onStatus: (status: string) => void;
  onCopyLanding: () => void;
  landingCopied: boolean;
  onPaymentsChanged: () => void;
  refreshAfterUpload: () => Promise<void>;
  onClose?: () => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  previewOriginalUrl: string | null;
  setPreviewOriginalUrl: (url: string | null) => void;
};

export function ApartmentSheetView(props: ApartmentSheetViewProps) {
  const [tab, setTab] = useState<SheetTab>('overview');
  const review = activeReview(props.apartment.in_review);
  const reviewEmail = props.blockedBy ?? (props.holding ? props.currentUserEmail : null) ?? review?.email ?? null;
  const statusLocked = Boolean(props.blockedBy) || (!props.holding && isLockedByOther(review, props.currentUserId));
  const cancel = () => {
    props.setEditing(false);
    props.setFormData(props.apartment);
  };

  return (
    <div>
      <ApartmentSheetHeader
        apartment={props.apartment}
        editing={props.editing}
        landingCopied={props.landingCopied}
        reviewEmail={reviewEmail}
        onCopyLanding={props.onCopyLanding}
        onEdit={() => props.setEditing(true)}
        onSave={props.onSave}
        onCancel={cancel}
        onClose={props.onClose}
      />
      <ApartmentSheetTabs tab={tab} onTab={setTab} />
      <ApartmentSheetPanels
        tab={tab}
        apartment={props.apartment}
        apartmentId={props.apartmentId}
        editing={props.editing}
        formData={props.formData}
        setFormData={props.setFormData}
        statusLocked={statusLocked}
        onStatus={props.onStatus}
        onPaymentsChanged={props.onPaymentsChanged}
        refreshAfterUpload={props.refreshAfterUpload}
        setPreviewUrl={props.setPreviewUrl}
        setPreviewOriginalUrl={props.setPreviewOriginalUrl}
      />
      <ApartmentPreviewModal
        previewUrl={props.previewUrl}
        setPreviewUrl={props.setPreviewUrl}
        previewOriginalUrl={props.previewOriginalUrl}
        setPreviewOriginalUrl={props.setPreviewOriginalUrl}
      />
    </div>
  );
}
