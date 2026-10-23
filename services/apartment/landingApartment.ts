import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

/** Public share-link payload. Omits buyer contact, payment, and balance fields. */
export async function getByLandingToken(token: string) {
  const trimmed = token?.trim();
  if (!trimmed) return null;
  const apartment = await loadPublicLanding(trimmed);
  return apartment ? toPublicLanding(apartment) : null;
}

type PublicLandingRecord = NonNullable<Awaited<ReturnType<typeof loadPublicLanding>>>;

async function loadPublicLanding(token: string) {
  return prisma.apartment.findUnique({
    where: { landingToken: token },
    select: {
      id: true,
      apartmentNo: true,
      apartmentName: true,
      apartmentType: true,
      floor: true,
      status: true,
      sqm: true,
      priceSqm: true,
      totalPrice: true,
      ownershipName: true,
      matterLink: true,
      floorplanDistribution: true,
      exteriorLink: true,
      exteriorLink2: true,
      notes: true,
      building: {
        select: {
          name: true,
          slug: true,
          district: { select: { id: true, name: true, slug: true } },
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
}

function landingTotalPrice(apartment: PublicLandingRecord): number | null {
  if (apartment.sqm && apartment.priceSqm) {
    return Number(apartment.sqm) * Number(apartment.priceSqm);
  }
  return apartment.totalPrice ? Number(apartment.totalPrice) : null;
}

function toPublicLanding(apartment: PublicLandingRecord) {
  return {
    id: apartment.id,
    apartmentNo: apartment.apartmentNo,
    apartmentName: apartment.apartmentName,
    apartmentType: apartment.apartmentType,
    floor: apartment.floor,
    status: apartment.status,
    sqm: apartment.sqm ? Number(apartment.sqm) : null,
    price_sqm: apartment.priceSqm ? Number(apartment.priceSqm) : null,
    total_price: landingTotalPrice(apartment),
    ownershipName: apartment.ownershipName,
    matterLink: apartment.matterLink,
    floorplanDistribution: apartment.floorplanDistribution,
    exteriorLink: apartment.exteriorLink,
    exteriorLink2: apartment.exteriorLink2,
    notes: apartment.notes,
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
