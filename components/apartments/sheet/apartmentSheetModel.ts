import {
  Banknote,
  Building2,
  Hash,
  Home,
  Layers,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Scale,
  User,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { formatAmd } from '@/lib/formatAmd';
import { getSalesTypeLabel, type Apartment } from '../apartmentCardModel';

export type SheetStat = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: 'teal' | 'pine' | 'sun';
};

export type SheetField = {
  label: string;
  value: string;
  icon: LucideIcon;
};

const EMPTY = '—';

function money(value: number | null | undefined): string {
  if (value == null) return EMPTY;
  return formatAmd(value);
}

function text(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : EMPTY;
}

export function apartmentSheetTitle(apartment: Apartment): string {
  return apartment.apartmentName?.trim() || `Apartment ${apartment.apartmentNo}`;
}

export function apartmentSheetSubtitle(apartment: Apartment): string {
  const place = `${apartment.district_name} · ${apartment.building_name}`;
  if (apartment.apartmentName?.trim()) return `Apartment ${apartment.apartmentNo} · ${place}`;
  return place;
}

export function apartmentInitials(apartmentNo: string): string {
  const compact = apartmentNo.replace(/[^a-zA-Z0-9]/g, '');
  return (compact.slice(0, 2) || 'AP').toUpperCase();
}

export function formatSheetDate(value: string | null | undefined): string {
  if (!value) return EMPTY;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY;
  return date.toLocaleDateString('en-GB');
}

export function apartmentSheetStats(apartment: Apartment): SheetStat[] {
  const price = apartment.total_price ?? 0;
  const paid = apartment.total_paid ?? 0;
  const balance = apartment.balance ?? price - paid;
  return [
    { label: 'Area', value: apartment.sqm != null ? `${apartment.sqm} m²` : EMPTY, icon: Ruler, tone: 'pine' },
    { label: 'Total price', value: money(apartment.total_price), icon: Banknote, tone: 'teal' },
    { label: 'Total paid', value: money(apartment.total_paid), icon: Wallet, tone: 'sun' },
    { label: 'Balance', value: money(balance), icon: Scale, tone: 'teal' },
    { label: 'Floor', value: apartment.floor != null ? String(apartment.floor) : EMPTY, icon: Layers, tone: 'sun' },
    { label: 'Type', value: apartment.apartmentType != null ? String(apartment.apartmentType) : EMPTY, icon: Home, tone: 'pine' },
  ];
}

export function apartmentSheetFields(apartment: Apartment): SheetField[] {
  return [
    { label: 'Apartment no', value: apartment.apartmentNo, icon: Hash },
    { label: 'Apt name', value: text(apartment.apartmentName), icon: Home },
    { label: 'Floor', value: apartment.floor != null ? String(apartment.floor) : EMPTY, icon: Layers },
    { label: 'District', value: text(apartment.district_name), icon: MapPin },
    { label: 'Building', value: text(apartment.building_name), icon: Building2 },
    { label: 'Price / m²', value: money(apartment.price_sqm), icon: Banknote },
    { label: 'Owner', value: text(apartment.ownershipName), icon: User },
    { label: 'Phone', value: text(apartment.phone), icon: Phone },
    { label: 'Email', value: text(apartment.email), icon: Mail },
  ];
}

export function sheetSalesLabel(apartment: Apartment): string {
  return getSalesTypeLabel(apartment.salesType);
}
