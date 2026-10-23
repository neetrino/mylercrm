import type { DropdownOption } from '@/components/ui/DropdownSelect';

export const APARTMENT_STATUS_OPTIONS: DropdownOption[] = [
  { value: 'UPCOMING', label: 'Upcoming', dotClassName: 'bg-gray-400' },
  { value: 'AVAILABLE', label: 'Available', dotClassName: 'bg-green-500' },
  { value: 'RESERVED', label: 'Reserved', dotClassName: 'bg-amber-400' },
  { value: 'SOLD', label: 'Sold', dotClassName: 'bg-blue-500' },
];
