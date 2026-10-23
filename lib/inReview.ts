export type InReviewDto = {
  userId: string;
  email: string;
  expiresAt: string;
};

type ReviewSource = {
  userId: string;
  expiresAt: Date;
  user: { email: string };
};

export function toInReview(review: ReviewSource | null | undefined, nowMs: number): InReviewDto | null {
  if (!review || review.expiresAt.getTime() <= nowMs) return null;
  return {
    userId: review.userId,
    email: review.user.email,
    expiresAt: review.expiresAt.toISOString(),
  };
}

export function activeReview<T extends { expiresAt?: string }>(
  review: T | null | undefined,
  nowMs: number = Date.now(),
): T | null {
  if (!review) return null;
  if (review.expiresAt && new Date(review.expiresAt).getTime() <= nowMs) return null;
  return review;
}

export function isLockedByOther(
  review: { userId: string; expiresAt?: string } | null | undefined,
  currentUserId: string | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!review) return false;
  if (review.expiresAt && new Date(review.expiresAt).getTime() <= nowMs) return false;
  return review.userId !== currentUserId;
}
