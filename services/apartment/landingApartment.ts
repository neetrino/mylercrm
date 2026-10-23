import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

/** Get apartment by public landing token (for share link). Returns null if not found. */
export async function getByLandingToken(token: string) {
  if (!token?.trim()) return null;
  const apartment = await prisma.apartment.findUnique({
    where: { landingToken: token.trim() },
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
      notes: true,
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
          createdAt: true,
        },
      },
    },
  });
  if (!apartment) return null;
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
  };

}

/** Ensure apartment has a landing token; generate if missing. Returns the token. */
export async function ensureLandingToken(id: number): Promise<string | null> {
  const apartment = await prisma.apartment.findUnique({
    where: { id },
    select: { landingToken: true },
  });
  if (!apartment) return null;
  if (apartment.landingToken) return apartment.landingToken;
  const token = crypto.randomBytes(24).toString('base64url');
  await prisma.apartment.update({
    where: { id },
    data: { landingToken: token },
  });
  return token;
}
