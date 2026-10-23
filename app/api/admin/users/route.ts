import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError } from '@/lib/appError';
import { handleRouteError, jsonError, zodErrorResponse } from '@/lib/apiErrorResponse';
import { requireAdmin } from '@/lib/requireAdmin';
import { createUserSchema } from '@/lib/validations';
import { createUser, listUsers } from '@/services/userAdmin';

export async function GET(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (gate instanceof NextResponse) return gate;
    const users = await listUsers();
    return NextResponse.json(users);
  } catch (error) {
    return handleRouteError(request, '[API] Error listing users', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (gate instanceof NextResponse) return gate;
    const body = createUserSchema.parse(await request.json());
    const user = await createUser(body);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return zodErrorResponse(request, error);
    if (error instanceof AppError) return jsonError(request, error.statusCode, { error: error.message });
    return handleRouteError(request, '[API] Error creating user', error);
  }
}
