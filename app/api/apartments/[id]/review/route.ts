import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { AppError } from '@/lib/appError';
import { handleRouteError, jsonError } from '@/lib/apiErrorResponse';
import { cacheTags, invalidateCache } from '@/lib/cache';
import { heartbeatReview, releaseReview } from '@/services/apartmentReview';

function parseApartmentId(value: string): number | null {
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}

function lockedResponse(email: string): NextResponse {
  return NextResponse.json(
    { error: `Apartment is in review by ${email}`, reviewer: email },
    { status: 409 },
  );
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
    const result = await heartbeatReview(id, session.user.id);
    if (!result.ok) return lockedResponse(result.email);
    if (result.changed) invalidateCache([], [cacheTags.apartmentsList]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AppError) return jsonError(request, error.statusCode, { error: error.message });
    return handleRouteError(request, '[API] Error updating apartment review', error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = parseApartmentId((await params).id);
    if (id === null) return NextResponse.json({ error: 'Invalid apartment ID' }, { status: 400 });
    const released = await releaseReview(id, session.user.id);
    if (released) invalidateCache([], [cacheTags.apartmentsList]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(request, '[API] Error releasing apartment review', error);
  }
}
