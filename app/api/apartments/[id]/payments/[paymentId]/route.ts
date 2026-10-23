import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { AppError } from '@/lib/appError';
import { handleRouteError, jsonError } from '@/lib/apiErrorResponse';
import { cacheKeys, cacheTags, invalidateCache } from '@/lib/cache';
import { deletePayment } from '@/services/apartmentPayments';

function parseId(value: string): number | null {
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> },
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: idParam, paymentId: paymentParam } = await params;
    const apartmentId = parseId(idParam);
    const paymentId = parseId(paymentParam);
    if (apartmentId === null || paymentId === null) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    await deletePayment(apartmentId, paymentId);
    invalidateCache(
      [cacheKeys.dashboard.summary, cacheKeys.dashboard.financial, cacheKeys.dashboard.timeline],
      [cacheTags.apartmentsList],
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AppError) return jsonError(request, error.statusCode, { error: error.message });
    return handleRouteError(request, '[API] Error deleting payment', error);
  }
}
