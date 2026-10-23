import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { AppError } from '@/lib/appError';
import { handleRouteError, jsonError, zodErrorResponse } from '@/lib/apiErrorResponse';
import { updateAccountSchema } from '@/lib/validations';
import { updateOwnAccount } from '@/services/accountSettings';

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return jsonError(request, 401, { error: 'Unauthorized' });
    const body = updateAccountSchema.parse(await request.json());
    const account = await updateOwnAccount(session.user.id, body);
    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof z.ZodError) return zodErrorResponse(request, error);
    if (error instanceof AppError) return jsonError(request, error.statusCode, { error: error.message });
    return handleRouteError(request, '[API] Error updating account', error);
  }
}
