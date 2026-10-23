'use client';

import { useEffect, useRef } from 'react';

const closers: Array<() => void> = [];
let listening = false;

function ensureEscapeListener() {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || closers.length === 0) return;
    event.preventDefault();
    closers[closers.length - 1]?.();
  });
}

/**
 * Escape closes only the topmost open layer (modal, sheet, or menu).
 * Pass `active` when the component stays mounted while closed.
 */
export function useCloseOnEscape(onClose: () => void, active = true) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return undefined;
    ensureEscapeListener();
    const close = () => onCloseRef.current();
    closers.push(close);
    return () => {
      const index = closers.lastIndexOf(close);
      if (index >= 0) closers.splice(index, 1);
    };
  }, [active]);
}
