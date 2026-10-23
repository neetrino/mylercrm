import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthorizedBearer } from '@/lib/apiToken';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import type { RateLimitKind } from '@/lib/rateLimit';
import { getOrCreateRequestId } from '@/lib/requestId';

function rateLimitResponse(request: NextRequest, retryAfterSec: number): NextResponse {
  const requestId = getOrCreateRequestId(request);
  return NextResponse.json(
    { error: 'Too many requests', requestId },
    {
      status: 429,
      headers: {
        'retry-after': String(retryAfterSec),
        'x-request-id': requestId,
      },
    }
  );
}

function unauthorized(request: NextRequest): NextResponse {
  const requestId = getOrCreateRequestId(request);
  return NextResponse.json(
    { error: 'Unauthorized', requestId },
    { status: 401, headers: { 'x-request-id': requestId } }
  );
}

function limitKind(path: string): RateLimitKind | null {
  if (path.startsWith('/api/external/')) return 'external';
  if (path.startsWith('/api/landing/')) return 'landing';
  if (path.startsWith('/api/auth/')) return 'auth';
  return null;
}

async function enforceRateLimit(req: NextRequest, path: string): Promise<NextResponse | null> {
  const kind = limitKind(path);
  if (!kind) return null;
  const { success, retryAfterSec } = await checkRateLimit(getClientIp(req), kind);
  if (!success) return rateLimitResponse(req, retryAfterSec);
  if (kind === 'auth') return NextResponse.next();
  return null;
}

function apiAccess(req: NextRequest, hasSession: boolean): NextResponse | null {
  const path = req.nextUrl.pathname;
  if (!path.startsWith('/api/')) return null;
  if (path.startsWith('/api/landing/') || path === '/api/health') return NextResponse.next();
  if (req.headers.get('authorization')) {
    return isAuthorizedBearer(req) ? NextResponse.next() : unauthorized(req);
  }
  return hasSession ? NextResponse.next() : unauthorized(req);
}

export default auth(async (req) => {
  const path = req.nextUrl.pathname;
  const limited = await enforceRateLimit(req, path);
  if (limited) return limited;

  const session = req.auth;
  if (path === '/login') {
    const destination = session ? '/apartments' : null;
    return destination
      ? NextResponse.redirect(new URL(destination, req.url))
      : NextResponse.next();
  }
  if (path.startsWith('/l/')) return NextResponse.next();

  const apiResponse = apiAccess(req, Boolean(session));
  if (apiResponse) return apiResponse;

  if (!session) return NextResponse.redirect(new URL('/login', req.url));
  if (path.startsWith('/admin') && session.user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/apartments', req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
