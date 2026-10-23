import { Prisma } from '@prisma/client';
import { AppError } from '@/lib/appError';
import { prisma } from '@/lib/prisma';

export type PaymentRow = {
  id: number;
  amount: number;
  paidAt: string;
  method: string | null;
  note: string | null;
  createdByEmail: string | null;
};

const paymentSelect = {
  id: true,
  amount: true,
  paidAt: true,
  method: true,
  note: true,
  createdBy: { select: { email: true } },
} satisfies Prisma.ApartmentPaymentSelect;

type PaymentRecord = Prisma.ApartmentPaymentGetPayload<{ select: typeof paymentSelect }>;

function toRow(payment: PaymentRecord): PaymentRow {
  return {
    id: payment.id,
    amount: Number(payment.amount),
    paidAt: payment.paidAt.toISOString().split('T')[0],
    method: payment.method,
    note: payment.note,
    createdByEmail: payment.createdBy?.email ?? null,
  };
}

export async function apartmentHasPayments(apartmentId: number): Promise<boolean> {
  const count = await prisma.apartmentPayment.count({ where: { apartmentId } });
  return count > 0;
}

async function assertApartment(apartmentId: number): Promise<void> {
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { id: true },
  });
  if (!apartment) throw new AppError('Apartment not found', 404);
}

async function recalculateTotalPaid(apartmentId: number): Promise<number> {
  const agg = await prisma.apartmentPayment.aggregate({
    where: { apartmentId },
    _sum: { amount: true },
  });
  const total = agg._sum.amount ? Number(agg._sum.amount) : 0;
  await prisma.apartment.update({
    where: { id: apartmentId },
    data: { totalPaid: total },
  });
  return total;
}

export async function listPayments(apartmentId: number): Promise<PaymentRow[]> {
  await assertApartment(apartmentId);
  const rows = await prisma.apartmentPayment.findMany({
    where: { apartmentId },
    select: paymentSelect,
    orderBy: [{ paidAt: 'desc' }, { id: 'desc' }],
  });
  return rows.map(toRow);
}

export async function createPayment(
  apartmentId: number,
  actorId: string,
  input: { amount: number; paidAt: string; method?: string | null; note?: string | null },
): Promise<PaymentRow> {
  await assertApartment(apartmentId);
  const created = await prisma.apartmentPayment.create({
    data: {
      apartmentId,
      amount: input.amount,
      paidAt: new Date(input.paidAt),
      method: input.method ?? null,
      note: input.note ?? null,
      createdById: actorId,
    },
    select: paymentSelect,
  });
  await recalculateTotalPaid(apartmentId);
  return toRow(created);
}

export async function deletePayment(apartmentId: number, paymentId: number): Promise<void> {
  const existing = await prisma.apartmentPayment.findFirst({
    where: { id: paymentId, apartmentId },
    select: { id: true },
  });
  if (!existing) throw new AppError('Payment not found', 404);
  await prisma.apartmentPayment.delete({ where: { id: paymentId } });
  await recalculateTotalPaid(apartmentId);
}
