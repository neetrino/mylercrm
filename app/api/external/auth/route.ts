import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authorizeUser } from '@/lib/authorize';
import { isAuthorizedBearer } from '@/lib/apiToken';
import { handleRouteError, zodErrorResponse } from '@/lib/apiErrorResponse';
import { externalAuthSchema } from '@/lib/validations';

/** Lets the 3D client check a CRM user. Machine calls still use API_TOKEN. */
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedBearer(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = externalAuthSchema.parse(await request.json());
    const user = await authorizeUser(body.email, body.password);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    if (error instanceof z.ZodError) return zodErrorResponse(request, error);
    return handleRouteError(request, '[API] Error authenticating external user', error);
  }
}
