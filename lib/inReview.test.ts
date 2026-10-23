import { describe, expect, it } from 'vitest';
import { isLockedByOther, toInReview } from './inReview';

const now = Date.parse('2026-10-23T12:00:00.000Z');

describe('toInReview', () => {
  it('returns null when the lock has expired', () => {
    const review = {
      userId: 'u1',
      expiresAt: new Date(now - 1),
      user: { email: 'a@meluvis.local' },
    };
    expect(toInReview(review, now)).toBeNull();
  });

  it('returns the reviewer while the lock is active', () => {
    const review = {
      userId: 'u1',
      expiresAt: new Date(now + 1000),
      user: { email: 'a@meluvis.local' },
    };
    expect(toInReview(review, now)?.email).toBe('a@meluvis.local');
  });
});

describe('isLockedByOther', () => {
  it('allows the holder to change status', () => {
    const review = { userId: 'u1', expiresAt: new Date(now + 1000).toISOString() };
    expect(isLockedByOther(review, 'u1', now)).toBe(false);
  });

  it('blocks a different user', () => {
    const review = { userId: 'u1', expiresAt: new Date(now + 1000).toISOString() };
    expect(isLockedByOther(review, 'u2', now)).toBe(true);
  });
});
