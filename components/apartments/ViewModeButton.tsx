'use client';

import type { ReactNode } from 'react';

export function ViewModeButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const tone = active
    ? 'bg-blue-600 text-white shadow-sm'
    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800';

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${tone}`}
    >
      {children}
    </button>
  );
}

