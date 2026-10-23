'use client';

import type { Dispatch, SetStateAction } from 'react';
import { activeReview, isLockedByOther } from '@/lib/inReview';
import { ApartmentCardChrome } from './ApartmentCardChrome';
import { ApartmentDealSection } from './ApartmentDealSection';
import { ApartmentLinksSection } from './ApartmentLinksSection';
import { ApartmentOverviewSection } from './ApartmentOverviewSection';
import { ApartmentPaymentsSection } from './ApartmentPaymentsSection';
import { ApartmentPreviewModal } from './ApartmentPreviewModal';
import type { Apartment } from './apartmentCardModel';

type ApartmentCardPageProps = {
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
  activeTab: 'overview' | 'links';
  setActiveTab: (tab: 'overview' | 'links') => void;
  landingCopied: boolean;
  handleCopyLandingLink: () => void;
  handleSave: () => void;
  handleStatusChange: (status: string) => void;
  onPaymentsChanged: () => void;
  refreshAfterUpload: () => Promise<void>;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  previewOriginalUrl: string | null;
  setPreviewOriginalUrl: (url: string | null) => void;
};

export function ApartmentCardPage(props: ApartmentCardPageProps) {
  const review = activeReview(props.apartment.in_review);
  const reviewEmail = props.blockedBy ?? (props.holding ? props.currentUserEmail : null) ?? review?.email ?? null;
  const statusLocked = Boolean(props.blockedBy) || (!props.holding && isLockedByOther(review, props.currentUserId));
  return (
    <div>
      <ApartmentCardChrome
        apartment={props.apartment}
        editing={props.editing}
        setFormData={props.setFormData}
        handleCopyLandingLink={props.handleCopyLandingLink}
        landingCopied={props.landingCopied}
        activeTab={props.activeTab}
        setActiveTab={props.setActiveTab}
        setEditing={props.setEditing}
        handleSave={props.handleSave}
        handleStatusChange={props.handleStatusChange}
        reviewEmail={reviewEmail}
        statusLocked={statusLocked}
      />
      <ApartmentCardPageBody {...props} />
      <ApartmentPreviewModal
        previewUrl={props.previewUrl}
        setPreviewUrl={props.setPreviewUrl}
        previewOriginalUrl={props.previewOriginalUrl}
        setPreviewOriginalUrl={props.setPreviewOriginalUrl}
      />
    </div>
  );
}

function ApartmentCardPageBody(props: ApartmentCardPageProps) {
  if (props.activeTab === 'links') {
    return (
      <div className="space-y-6">
        <ApartmentLinksSection
          apartment={props.apartment}
          editing={props.editing}
          formData={props.formData}
          setFormData={props.setFormData}
          apartmentId={props.apartmentId}
          refreshAfterUpload={props.refreshAfterUpload}
          setPreviewUrl={props.setPreviewUrl}
          setPreviewOriginalUrl={props.setPreviewOriginalUrl}
        />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <ApartmentOverviewSection
        apartment={props.apartment}
        editing={props.editing}
        formData={props.formData}
        setFormData={props.setFormData}
      />
      <ApartmentPaymentsSection apartmentId={props.apartmentId} onChanged={props.onPaymentsChanged} />
      <ApartmentDealSection
        apartment={props.apartment}
        editing={props.editing}
        formData={props.formData}
        setFormData={props.setFormData}
        apartmentId={props.apartmentId}
        refreshAfterUpload={props.refreshAfterUpload}
      />
    </div>
  );
}
