'use client';

import { useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { useDismissOnOutside, useMenuPosition, type MenuBox } from './dropdownSelectPosition';

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
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const FIELD_TRIGGER =
  'flex h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 text-left text-sm text-gray-900 shadow-sm transition hover:border-blue-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30';

export function DropdownSelect(props: DropdownSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menu = useDropdownMenu(props, rootRef, menuRef);

  return (
    <div ref={rootRef} className={props.fullWidth === false ? 'relative inline-block' : 'relative w-full'}>
      <DropdownTrigger
        id={props.id}
        listId={menu.listId}
        open={menu.open}
        disabled={props.disabled ?? false}
        ariaLabel={props.ariaLabel}
        label={menu.selected?.label ?? props.placeholder}
        muted={!menu.selected}
        dotClassName={props.triggerClassName ? undefined : menu.selected?.dotClassName}
        triggerClassName={props.triggerClassName}
        onToggle={() => menu.toggle(props.disabled ?? false)}
      />
      {menu.open && menu.box ? (
        <SelectMenu
          menuRef={menuRef}
          id={menu.listId}
          box={menu.box}
          value={props.value}
          options={props.options}
          onSelect={menu.choose}
        />
      ) : null}
    </div>
  );
}

function useDropdownMenu(
  {
    value,
    onChange,
    options,
    align = 'start',
    fullWidth = true,
    onOpenChange,
  }: DropdownSelectProps,
  rootRef: { current: HTMLDivElement | null },
  menuRef: { current: HTMLUListElement | null },
) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const selected = options.find((option) => option.value === value);
  const box = useMenuPosition(open, rootRef, align, fullWidth);

  const setOpenState = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useDismissOnOutside(open, rootRef, menuRef, () => setOpenState(false));

  return {
    open,
    listId,
    selected,
    box,
    toggle: (disabled: boolean) => {
      if (!disabled) setOpenState(!open);
    },
    choose: (next: string) => {
      onChange(next);
      setOpenState(false);
    },
  };
}

function DropdownTrigger({
  id,
  listId,
  open,
  disabled,
  ariaLabel,
  label,
  muted,
  dotClassName,
  triggerClassName,
  onToggle,
}: {
  id?: string;
  listId: string;
  open: boolean;
  disabled: boolean;
  ariaLabel: string;
  label: string;
  muted: boolean;
  dotClassName?: string;
  triggerClassName?: string;
  onToggle: () => void;
}) {
  const trigger = `${triggerClassName ?? FIELD_TRIGGER}${disabled ? ' cursor-not-allowed opacity-60' : ''}`;

  return (
    <button
      id={id}
      type="button"
      aria-label={ariaLabel}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listId}
      disabled={disabled}
      onClick={onToggle}
      className={trigger}
    >
      <span className="flex min-w-0 items-center gap-2">
        {dotClassName ? <span className={`h-2 w-2 shrink-0 rounded-full ${dotClassName}`} /> : null}
        <span className={`truncate ${muted ? 'text-gray-400' : ''}`}>{label}</span>
      </span>
      <ChevronDown
        className={`h-3.5 w-3.5 shrink-0 opacity-70 transition ${open ? 'rotate-180' : ''}`}
        aria-hidden
      />
    </button>
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
      className={`dropdown-scroll fixed z-[260] max-h-64 overflow-auto rounded-xl border border-blue-100 bg-white p-1.5 shadow-card ${lift}`}
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
    ? 'bg-blue-50 font-medium text-blue-900'
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
