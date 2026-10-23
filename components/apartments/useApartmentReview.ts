'use client';

import { useEffect, useState } from 'react';
import { REVIEW_HEARTBEAT_MS } from '@/lib/reviewTiming';

async function postReview(apartmentId: number): Promise<{ holding: boolean; blockedBy: string | null }> {
  const response = await fetch(`/api/apartments/${apartmentId}/review`, { method: 'POST' });
  if (response.ok) return { holding: true, blockedBy: null };
  if (response.status !== 409) return { holding: false, blockedBy: null };
  const body = await response.json().catch(() => ({}));
  const reviewer = typeof body.reviewer === 'string' ? body.reviewer : 'another user';
  return { holding: false, blockedBy: reviewer };
}

function releaseReview(apartmentId: number): void {
  void fetch(`/api/apartments/${apartmentId}/review`, { method: 'DELETE', keepalive: true });
}

export function useApartmentReview(apartmentId: number): { blockedBy: string | null; holding: boolean } {
  const [blockedBy, setBlockedBy] = useState<string | null>(null);
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    let stopped = false;
    const beat = async () => {
      const result = await postReview(apartmentId);
      if (stopped) return;
      setBlockedBy(result.blockedBy);
      setHolding(result.holding);
    };
    void beat();
    const timer = setInterval(() => {
      void beat();
    }, REVIEW_HEARTBEAT_MS);
    const release = () => {
      releaseReview(apartmentId);
    };
    window.addEventListener('pagehide', release);
    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener('pagehide', release);
      release();
    };
  }, [apartmentId]);

  return { blockedBy, holding };
}
