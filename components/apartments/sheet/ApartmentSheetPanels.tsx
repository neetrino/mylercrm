'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { Apartment } from '../apartmentCardModel';
import { ApartmentDealSection } from '../ApartmentDealSection';
import { ApartmentLinksSection } from '../ApartmentLinksSection';
import { ApartmentOverviewSection } from '../ApartmentOverviewSection';
import { ApartmentPaymentsSection } from '../ApartmentPaymentsSection';
import { ApartmentSheetOverview } from './ApartmentSheetOverview';
import type { SheetTab } from './ApartmentSheetTabs';

type ApartmentSheetPanelsProps = {
  tab: SheetTab;
  apartment: Apartment;
  apartmentId: number;
  editing: boolean;
  formData: Partial<Apartment>;
  setFormData: Dispatch<SetStateAction<Partial<Apartment>>>;
  statusLocked: boolean;
  onStatus: (status: string) => void;
  onPaymentsChanged: () => void;
  refreshAfterUpload: () => Promise<void>;
  setPreviewUrl: (url: string | null) => void;
  setPreviewOriginalUrl: (url: string | null) => void;
};

export function ApartmentSheetPanels(props: ApartmentSheetPanelsProps) {
  if (props.tab === 'payments') {
    return <ApartmentPaymentsSection apartmentId={props.apartmentId} onChanged={props.onPaymentsChanged} />;
  }
  if (props.tab === 'deal') return <DealPanel {...props} />;
  if (props.tab === 'links') return <LinksPanel {...props} />;
  if (props.editing) return <OverviewEditor {...props} />;
  return <ApartmentSheetOverview apartment={props.apartment} statusLocked={props.statusLocked} onStatus={props.onStatus} />;
}

function OverviewEditor(props: ApartmentSheetPanelsProps) {
  return (
    <ApartmentOverviewSection
      apartment={props.apartment}
      editing={props.editing}
      formData={props.formData}
      setFormData={props.setFormData}
    />
  );
}

function DealPanel(props: ApartmentSheetPanelsProps) {
  return (
    <ApartmentDealSection
      apartment={props.apartment}
      editing={props.editing}
      formData={props.formData}
      setFormData={props.setFormData}
      apartmentId={props.apartmentId}
      refreshAfterUpload={props.refreshAfterUpload}
    />
  );
}

function LinksPanel(props: ApartmentSheetPanelsProps) {
  return (
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
  );
}
