'use client';

import { useEffect } from 'react';
import { REVIEW_HEARTBEAT_MS } from '@/lib/reviewTiming';

export function useReviewListPoll(
  refresh: (page: number, silent: boolean) => void,
  page: number,
): void {
  useEffect(() => {
    const timer = setInterval(() => {
      refresh(page, true);
    }, REVIEW_HEARTBEAT_MS);
    return () => clearInterval(timer);
  }, [refresh, page]);
}
