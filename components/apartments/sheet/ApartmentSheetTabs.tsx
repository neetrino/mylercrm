'use client';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'payments', label: 'Payments' },
  { id: 'deal', label: 'Deal' },
  { id: 'links', label: 'Links & files' },
] as const;

export type SheetTab = (typeof TABS)[number]['id'];

type ApartmentSheetTabsProps = {
  tab: SheetTab;
  onTab: (tab: SheetTab) => void;
};

export function ApartmentSheetTabs({ tab, onTab }: ApartmentSheetTabsProps) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto rounded-full bg-blue-50 p-1">
      {TABS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onTab(item.id)}
          className={item.id === tab
            ? 'shrink-0 rounded-full bg-blue-800 px-4 py-2 text-sm font-medium text-white'
            : 'shrink-0 rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900'}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
