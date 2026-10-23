import { AppError } from '@/lib/appError';
import { toInReview, type InReviewDto } from '@/lib/inReview';
import { prisma } from '@/lib/prisma';
import { REVIEW_TTL_MS } from '@/lib/reviewTiming';

const reviewSelect = {
  userId: true,
  expiresAt: true,
  user: { select: { email: true } },
} as const;

async function assertApartment(apartmentId: number): Promise<void> {
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { id: true },
  });
  if (!apartment) throw new AppError('Apartment not found', 404);
}

export async function readActiveReview(apartmentId: number): Promise<InReviewDto | null> {
  const review = await prisma.apartmentReview.findUnique({
    where: { apartmentId },
    select: reviewSelect,
  });
  return toInReview(review, Date.now());
}

export async function heartbeatReview(
  apartmentId: number,
  userId: string,
): Promise<{ ok: true; changed: boolean } | { ok: false; email: string }> {
  await assertApartment(apartmentId);
  const existing = await prisma.apartmentReview.findUnique({
    where: { apartmentId },
    select: reviewSelect,
  });
  const now = Date.now();
  const active = toInReview(existing, now);
  if (active && active.userId !== userId) {
    return { ok: false, email: active.email };
  }
  const expiresAt = new Date(now + REVIEW_TTL_MS);
  await prisma.apartmentReview.upsert({
    where: { apartmentId },
    create: { apartmentId, userId, expiresAt },
    update: { userId, expiresAt },
  });
  const changed = !active || active.userId !== userId;
  return { ok: true, changed };
}

export async function releaseReview(apartmentId: number, userId: string): Promise<boolean> {
  const result = await prisma.apartmentReview.deleteMany({
    where: { apartmentId, userId },
  });
  return result.count > 0;
}

export async function assertStatusChangeAllowed(
  apartmentId: number,
  actorUserId: string | null,
): Promise<{ allowed: true } | { allowed: false; email: string }> {
  const active = await readActiveReview(apartmentId);
  if (!active) return { allowed: true };
  if (actorUserId && active.userId === actorUserId) return { allowed: true };
  return { allowed: false, email: active.email };
}
