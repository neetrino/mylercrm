import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function requireAdmin(): Promise<{ userId: string } | NextResponse> {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return { userId: session.user.id };
}
