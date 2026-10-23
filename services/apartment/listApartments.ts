import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { ApartmentStatus } from '@prisma/client';
import { toInReview } from '@/lib/inReview';

export async function listApartments(filters?: {
  buildingId?: number;
  status?: ApartmentStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const page = filters?.page || 1;
  const limit = Math.min(filters?.limit || 21, 100);
  const skip = (page - 1) * limit;

  const where: Prisma.ApartmentWhereInput = {};

  if (filters?.buildingId) {
    where.buildingId = filters.buildingId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  const searchTrimmed = filters?.search?.trim();
  if (searchTrimmed) {
    where.OR = [
      { apartmentNo: { contains: searchTrimmed, mode: 'insensitive' } },
      { building: { name: { contains: searchTrimmed, mode: 'insensitive' } } },
      { building: { district: { name: { contains: searchTrimmed, mode: 'insensitive' } } } },
      { ownershipName: { contains: searchTrimmed, mode: 'insensitive' } },
    ];
  }

  // Определяем поле и порядок сортировки
  const sortBy = filters?.sortBy || 'apartmentNo';
  const sortOrder = filters?.sortOrder || 'asc';

  // Маппинг полей для сортировки
  let orderBy: Prisma.ApartmentOrderByWithRelationInput = {
    apartmentNo: sortOrder,
  };

  switch (sortBy) {
    case 'apartmentNo':
      orderBy = { apartmentNo: sortOrder };
      break;
    case 'status':
      orderBy = { status: sortOrder };
      break;
    case 'sqm':
      orderBy = { sqm: sortOrder };
      break;
    case 'total_price':
      // Сортировка по вычисляемому полю - используем totalPrice из БД
      orderBy = { totalPrice: sortOrder };
      break;
    case 'total_paid':
      orderBy = { totalPaid: sortOrder };
      break;
    case 'balance':
      // Для balance используем сортировку по totalPrice и totalPaid
      // Это приблизительная сортировка, точная требует вычисления
      orderBy = { totalPrice: sortOrder };
      break;
    case 'building':
      // Сортировка по зданию будет выполнена после получения данных
      // Используем apartmentNo как временную сортировку
      orderBy = { apartmentNo: 'asc' };
      break;
    default:
      orderBy = { apartmentNo: 'asc' };
  }

  // Оптимизация: используем select вместо include для меньшего объёма данных
  const [apartments, total] = await Promise.all([
    prisma.apartment.findMany({
      where,
      select: {
        id: true,
        buildingId: true,
        apartmentNo: true,
        apartmentName: true,
        apartmentType: true,
        floor: true,
        status: true,
        sqm: true,
        priceSqm: true,
        totalPrice: true,
        totalPaid: true,
        dealDate: true,
        ownershipName: true,
        email: true,
        passportTaxNo: true,
        phone: true,
        salesType: true,
        dealDescription: true,
      matterLink: true,
      floorplanDistribution: true,
      exteriorLink: true,
      exteriorLink2: true,
      buyerAddress: true,
      otherBuyers: true,
      paymentSchedule: true,
      balanceRemaining: true,
      landingToken: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      building: {
        select: {
          id: true,
          name: true,
          slug: true,
          district: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        attachments: {
          select: {
            id: true,
            fileType: true,
            fileName: true,
            fileUrl: true,
            fileSize: true,
            md5Hash: true,
            createdAt: true,
          },
        },
        review: {
          select: {
            userId: true,
            expiresAt: true,
            user: { select: { email: true } },
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.apartment.count({ where }),
  ]);

  // Вычисляемые поля
  const apartmentsWithCalculations = apartments.map((apt) => {
    const { review, ...rest } = apt;
    const totalPrice =
      rest.sqm && rest.priceSqm
        ? Number(rest.sqm) * Number(rest.priceSqm)
        : null;

    const balance =
      totalPrice && rest.totalPaid
        ? totalPrice - Number(rest.totalPaid)
        : totalPrice;

    return {
      ...rest,
      in_review: toInReview(review, Date.now()),
      total_price: totalPrice,
      balance,
      sqm: rest.sqm ? Number(rest.sqm) : null,
      price_sqm: rest.priceSqm ? Number(rest.priceSqm) : null,
      total_paid: rest.totalPaid ? Number(rest.totalPaid) : null,
      deal_date: rest.dealDate ? rest.dealDate.toISOString().split('T')[0] : null,
      ownership_name: rest.ownershipName,
      email: rest.email,
      passport_tax_no: rest.passportTaxNo,
      phone: rest.phone,
      sales_type: rest.salesType,
      deal_description: rest.dealDescription,
      matter_link: rest.matterLink,
      floorplan_distribution: rest.floorplanDistribution,
      exterior_link: rest.exteriorLink,
      exterior_link2: rest.exteriorLink2,
      buyer_address: rest.buyerAddress,
      other_buyers: rest.otherBuyers,
      payment_schedule: rest.paymentSchedule,
      balance_remaining: rest.balanceRemaining ? Number(rest.balanceRemaining) : null,
      attachments: rest.attachments || [],
    };
  });

  // Если сортировка по balance, сортируем после вычисления
  if (sortBy === 'balance') {
    apartmentsWithCalculations.sort((a, b) => {
      const balanceA = a.balance ?? 0;
      const balanceB = b.balance ?? 0;
      return sortOrder === 'asc' ? balanceA - balanceB : balanceB - balanceA;
    });
  }

  // Если сортировка по building, сортируем по имени здания после получения данных
  if (sortBy === 'building') {
    apartmentsWithCalculations.sort((a, b) => {
      const buildingA = `${a.building.district.name} - ${a.building.name}`;
      const buildingB = `${b.building.district.name} - ${b.building.name}`;
      if (sortOrder === 'asc') {
        return buildingA.localeCompare(buildingB);
      } else {
        return buildingB.localeCompare(buildingA);
      }
    });
  }

  return {
    items: apartmentsWithCalculations,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}
