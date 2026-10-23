import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { AppError } from '@/lib/appError';
import { handleRouteError, jsonError, zodErrorResponse } from '@/lib/apiErrorResponse';
import { cacheKeys, cacheTags, invalidateCache } from '@/lib/cache';
import { createPaymentSchema } from '@/lib/validations';
import { createPayment, listPayments } from '@/services/apartmentPayments';

function parseApartmentId(value: string): number | null {
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}

function invalidatePaymentCaches(): void {
  invalidateCache(
    [cacheKeys.dashboard.summary, cacheKeys.dashboard.financial, cacheKeys.dashboard.timeline],
    [cacheTags.apartmentsList],
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = parseApartmentId((await params).id);
    if (id === null) return NextResponse.json({ error: 'Invalid apartment ID' }, { status: 400 });
    const items = await listPayments(id);
    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof AppError) return jsonError(request, error.statusCode, { error: error.message });
    return handleRouteError(request, '[API] Error listing payments', error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = parseApartmentId((await params).id);
    if (id === null) return NextResponse.json({ error: 'Invalid apartment ID' }, { status: 400 });
    const body = createPaymentSchema.parse(await request.json());
    const payment = await createPayment(id, session.user.id, body);
    invalidatePaymentCaches();
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return zodErrorResponse(request, error);
    if (error instanceof AppError) return jsonError(request, error.statusCode, { error: error.message });
    return handleRouteError(request, '[API] Error creating payment', error);
  }
}
