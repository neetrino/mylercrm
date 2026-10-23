import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { ApartmentStatus } from '@prisma/client';

export async function createApartment(data: {
  buildingId: number;
  apartmentNo: string;
  apartmentName?: string | null;
  apartmentType?: number;
  floor?: number;
  sqm?: number;
  priceSqm?: number;
  status?: ApartmentStatus;
}) {
  // Проверка существования здания
  const building = await prisma.building.findUnique({
    where: { id: data.buildingId },
  });

  if (!building) {
    throw new Error('Здание не найдено');
  }

  // Проверка уникальности apartment_no в здании
  const existing = await prisma.apartment.findUnique({
    where: {
      buildingId_apartmentNo: {
        buildingId: data.buildingId,
        apartmentNo: data.apartmentNo.trim(),
      },
    },
  });

  if (existing) {
    throw new Error(
      `Квартира с номером ${data.apartmentNo} уже существует в этом здании`
    );
  }

  // Вычисление total_price
  const totalPrice =
    data.sqm && data.priceSqm
      ? new Prisma.Decimal(data.sqm * data.priceSqm)
      : null;

  return await prisma.apartment.create({
    data: {
      buildingId: data.buildingId,
      apartmentNo: data.apartmentNo.trim(),
      apartmentName: data.apartmentName?.trim() || null,
      apartmentType: data.apartmentType,
      floor: data.floor,
      sqm: data.sqm,
      priceSqm: data.priceSqm,
      totalPrice: totalPrice,
      status: data.status || 'UPCOMING',
    },
    include: {
      building: {
        include: {
          district: true,
        },
      },
    },
  });

}

export async function updateApartment(id: number, data: Prisma.ApartmentUpdateInput) {
  // Если обновляются sqm или priceSqm, пересчитываем totalPrice
  if (data.sqm !== undefined || data.priceSqm !== undefined) {
    const current = await prisma.apartment.findUnique({
      where: { id },
      select: { sqm: true, priceSqm: true },
    });

    if (current) {
      const sqm = data.sqm !== undefined ? data.sqm : current.sqm;
      const priceSqm =
        data.priceSqm !== undefined ? data.priceSqm : current.priceSqm;

      if (sqm && priceSqm) {
        data.totalPrice = new Prisma.Decimal(Number(sqm) * Number(priceSqm));
      }
    }
  }

  return await prisma.apartment.update({
    where: { id },
    data,
    include: {
      building: {
        include: {
          district: true,
        },
      },
    },
  });

}

export async function updateApartmentStatus(id: number, status: ApartmentStatus) {
  // Валидация: при статусе SOLD желательно иметь deal_date и ownership_name
  if (status === 'SOLD') {
    const apartment = await prisma.apartment.findUnique({
      where: { id },
      select: { dealDate: true, ownershipName: true },
    });

    // Apartment marked SOLD; deal_date/ownership_name may be filled later
  }

  return await prisma.apartment.update({
    where: { id },
    data: { status, updatedAt: new Date() },
  });

}

export async function deleteApartment(id: number) {
  await prisma.apartment.delete({
    where: { id },
  });
}
