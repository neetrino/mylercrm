'use client';

import { useEffect, useState } from 'react';
import { REVIEW_HEARTBEAT_MS } from '@/lib/reviewTiming';

async function sendReview(apartmentId: number, method: 'POST' | 'DELETE'): Promise<string | null> {
  const response = await fetch(`/api/apartments/${apartmentId}/review`, { method, keepalive: true });
  if (response.status !== 409) return null;
  const body = await response.json().catch(() => ({}));
  return typeof body.reviewer === 'string' ? body.reviewer : 'another user';
}

export function useApartmentReview(apartmentId: number): { blockedBy: string | null } {
  const [blockedBy, setBlockedBy] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;
    const beat = async () => {
      const reviewer = await sendReview(apartmentId, 'POST');
      if (!stopped) setBlockedBy(reviewer);
    };
    void beat();
    const timer = setInterval(() => {
      void beat();
    }, REVIEW_HEARTBEAT_MS);
    const release = () => {
      void sendReview(apartmentId, 'DELETE');
    };
    window.addEventListener('pagehide', release);
    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener('pagehide', release);
      release();
    };
  }, [apartmentId]);

  return { blockedBy };
}
