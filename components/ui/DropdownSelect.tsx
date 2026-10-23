'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export type DropdownOption = {
  value: string;
  label: string;
  dotClassName?: string;
};

type DropdownSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  ariaLabel: string;
  triggerClassName?: string;
  align?: 'start' | 'end';
  fullWidth?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type MenuAlign = 'start' | 'end';

type MenuBox = {
  top: number;
  left: number;
  width: number;
  openUp: boolean;
};

const FIELD_TRIGGER =
  'flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 text-left text-sm text-gray-900 shadow-sm transition hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

const MENU_OFFSET = 6;
const VIEWPORT_GUTTER = 8;
const COMPACT_MENU_WIDTH = 176;
const OPEN_UP_THRESHOLD = 220;

export function DropdownSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  triggerClassName,
  align = 'start',
  fullWidth = true,
  onOpenChange,
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);
  const box = useMenuPosition(open, rootRef, align, fullWidth);

  const setOpenState = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useDismissOnOutside(open, rootRef, menuRef, () => setOpenState(false));

  return (
    <div ref={rootRef} className={fullWidth ? 'relative w-full' : 'relative inline-block'}>
      <button
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpenState(!open)}
        className={triggerClassName ?? FIELD_TRIGGER}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 opacity-70 transition ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open && box ? (
        <SelectMenu
          menuRef={menuRef}
          id={listId}
          box={box}
          value={value}
          options={options}
          onSelect={(next) => {
            onChange(next);
            setOpenState(false);
          }}
        />
      ) : null}
    </div>
  );
}

function SelectMenu({
  menuRef,
  id,
  box,
  value,
  options,
  onSelect,
}: {
  menuRef: { current: HTMLUListElement | null };
  id: string;
  box: MenuBox;
  value: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
}) {
  const lift = box.openUp ? '-translate-y-full' : '';

  return createPortal(
    <ul
      ref={menuRef}
      id={id}
      role="listbox"
      style={{ top: box.top, left: box.left, width: box.width }}
      className={`dropdown-scroll fixed z-50 max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg ${lift}`}
    >
      {options.map((option) => (
        <SelectOption
          key={option.value || 'all'}
          option={option}
          selected={option.value === value}
          onSelect={onSelect}
        />
      ))}
    </ul>,
    document.body,
  );
}

function SelectOption({
  option,
  selected,
  onSelect,
}: {
  option: DropdownOption;
  selected: boolean;
  onSelect: (value: string) => void;
}) {
  const row = selected
    ? 'bg-blue-50 font-medium text-blue-700'
    : 'text-gray-700 hover:bg-gray-50';

  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={() => onSelect(option.value)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${row}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {option.dotClassName ? (
            <span className={`h-2 w-2 shrink-0 rounded-full ${option.dotClassName}`} />
          ) : null}
          <span className="truncate">{option.label}</span>
        </span>
        {selected ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : null}
      </button>
    </li>
  );
}

function useMenuPosition(
  open: boolean,
  anchorRef: { current: HTMLDivElement | null },
  align: MenuAlign,
  fullWidth: boolean,
): MenuBox | null {
  const [box, setBox] = useState<MenuBox | null>(null);

  useLayoutEffect(() => {
    if (!open) return undefined;
    const place = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      setBox(measureMenu(anchor, align, fullWidth));
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, align, fullWidth, anchorRef]);

  return open ? box : null;
}

function measureMenu(anchor: HTMLDivElement, align: MenuAlign, fullWidth: boolean): MenuBox {
  const rect = anchor.getBoundingClientRect();
  const width = fullWidth ? rect.width : COMPACT_MENU_WIDTH;
  const rawLeft = align === 'end' ? rect.right - width : rect.left;
  const maxLeft = window.innerWidth - width - VIEWPORT_GUTTER;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUp = spaceBelow < OPEN_UP_THRESHOLD && rect.top > spaceBelow;

  return {
    top: openUp ? rect.top - MENU_OFFSET : rect.bottom + MENU_OFFSET,
    left: Math.max(VIEWPORT_GUTTER, Math.min(rawLeft, maxLeft)),
    width,
    openUp,
  };
}

function useDismissOnOutside(
  open: boolean,
  rootRef: { current: HTMLElement | null },
  menuRef: { current: HTMLElement | null },
  onClose: () => void,
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      onCloseRef.current();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('click', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, rootRef, menuRef]);
}
