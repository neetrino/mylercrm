'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export type MenuAlign = 'start' | 'end';

export type MenuBox = {
  top: number;
  left: number;
  width: number;
  openUp: boolean;
};

const MENU_OFFSET = 6;
const VIEWPORT_GUTTER = 8;
const COMPACT_MENU_WIDTH = 176;
const OPEN_UP_THRESHOLD = 220;

export function useMenuPosition(
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

export function useDismissOnOutside(
  open: boolean,
  rootRef: { current: HTMLElement | null },
  menuRef: { current: HTMLElement | null },
  onClose: () => void,
) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

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
