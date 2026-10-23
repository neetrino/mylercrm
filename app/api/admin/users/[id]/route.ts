import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError } from '@/lib/appError';
import { handleRouteError, jsonError, zodErrorResponse } from '@/lib/apiErrorResponse';
import { requireAdmin } from '@/lib/requireAdmin';
import { updateUserSchema } from '@/lib/validations';
import { updateUser } from '@/services/userAdmin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const gate = await requireAdmin();
    if (gate instanceof NextResponse) return gate;
    const { id } = await params;
    const body = updateUserSchema.parse(await request.json());
    const user = await updateUser(id, gate.userId, body);
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) return zodErrorResponse(request, error);
    if (error instanceof AppError) return jsonError(request, error.statusCode, { error: error.message });
    return handleRouteError(request, '[API] Error updating user', error);
  }
}
