import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
  assertNoExternalApartmentNoConflict,
  assertUniqueApartmentNosInBatch,
  buildBulkTempApartmentNo,
  mergeBulkApartmentRows,
} from '@/lib/apartmentBulkUpdate';

export async function bulkUpdateApartments(items: Array<{ id: number; apartmentNo?: string; apartmentName?: string | null }>) {
  const ids = items.map((i) => i.id);
  const existing = await prisma.apartment.findMany({
    where: { id: { in: ids } },
    select: { id: true, buildingId: true, apartmentNo: true, apartmentName: true },
  });
  if (existing.length !== ids.length) {
    throw new Error('One or more apartments not found');
  }
  const byId = new Map(existing.map((a) => [a.id, a]));
  const merged = mergeBulkApartmentRows(items, byId);
  assertUniqueApartmentNosInBatch(merged);
  await assertNoExternalApartmentNoConflict(prisma, ids, merged);

  const mergedById = new Map(merged.map((m) => [m.id, m]));

  return prisma.$transaction(async (tx) => {
    const rowsChangingNo = merged.filter((m) => m.newNo !== m.oldNo);
    for (const m of rowsChangingNo) {
      await tx.apartment.update({
        where: { id: m.id },
        data: { apartmentNo: buildBulkTempApartmentNo(m.id) },
      });
    }

    const results: Array<{ id: number; apartmentNo: string; apartmentName: string | null }> = [];
    for (const item of items) {
      const data: Prisma.ApartmentUpdateInput = {};
      const m = mergedById.get(item.id)!;
      if (item.apartmentNo !== undefined) {
        data.apartmentNo = m.newNo;
      }
      if (item.apartmentName !== undefined) {
        data.apartmentName = m.newName;
      }
      if (Object.keys(data).length === 0) continue;
      const upd = await tx.apartment.update({
        where: { id: item.id },
        data,
        select: { id: true, apartmentNo: true, apartmentName: true },
      });
      results.push(upd);
    }
    return results;
  });
}
