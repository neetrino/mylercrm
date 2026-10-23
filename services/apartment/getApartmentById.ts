import { prisma } from '@/lib/prisma';

export async function getApartmentById(id: number) {
  // Оптимизация: используем select для загрузки только нужных полей
  const apartment = await prisma.apartment.findUnique({
    where: { id },
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
          fileUrl: true,
          fileName: true,
          fileSize: true,
          md5Hash: true,
          createdAt: true,
        },
      },
    },
  });

  if (!apartment) {
    return null;
  }

  // Вычисляемые поля
  const totalPrice =
    apartment.sqm && apartment.priceSqm
      ? Number(apartment.sqm) * Number(apartment.priceSqm)
      : null;

  const balance =
    totalPrice && apartment.totalPaid
      ? totalPrice - Number(apartment.totalPaid)
      : totalPrice;

  return {
    ...apartment,
    total_price: totalPrice,
    balance,
    sqm: apartment.sqm ? Number(apartment.sqm) : null,
    price_sqm: apartment.priceSqm ? Number(apartment.priceSqm) : null,
    total_paid: apartment.totalPaid ? Number(apartment.totalPaid) : null,
    buyer_address: apartment.buyerAddress,
    other_buyers: apartment.otherBuyers,
    payment_schedule: apartment.paymentSchedule,
    balance_remaining: apartment.balanceRemaining ? Number(apartment.balanceRemaining) : null,
    attachments: apartment.attachments,
    building_name: apartment.building.name,
    building_slug: apartment.building.slug,
    district_id: apartment.building.district.id,
    district_slug: apartment.building.district.slug,
    district_name: apartment.building.district.name,
  };\n}\n