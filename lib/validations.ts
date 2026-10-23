import { z } from 'zod';

// Slug validation: lowercase, kebab-case, no special chars
const slugSchema = z
  .string()
  .min(1, 'Slug не может быть пустым')
  .max(255, 'Slug слишком длинный')
  .regex(
    /^[a-z0-9-]+$/,
    'Slug может содержать только строчные буквы, цифры и дефисы'
  )
  .transform((val) => val.toLowerCase().trim().replace(/\s+/g, '-'));

export const createDistrictSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(255),
  slug: slugSchema,
});

export const updateDistrictSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: slugSchema.optional(),
});

export const createBuildingSchema = z.object({
  districtId: z.number().int().positive('ID района должен быть положительным'),
  name: z.string().min(1, 'Название обязательно').max(255),
  slug: slugSchema,
});

export const updateBuildingSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: slugSchema.optional(),
  districtId: z.number().int().positive().optional(),
  floorsCount: z.number().int().min(0).optional().nullable(),
});

// Apartment schemas
const apartmentStatusSchema = z.enum([
  'UPCOMING',
  'AVAILABLE',
  'RESERVED',
  'SOLD',
]);

const salesTypeSchema = z.enum(['UNSOLD', 'MORTGAGE', 'CASH', 'TIMEBASED']);

export const createApartmentSchema = z.object({
  buildingId: z.number().int().positive('ID здания должен быть положительным'),
  apartmentNo: z.string().min(1, 'Номер квартиры обязателен').max(50),
  apartmentName: z.string().max(255).optional().nullable().or(z.literal('').transform(() => null)),
  apartmentType: z.number().int().optional(),
  floor: z.number().int().optional(),
  sqm: z.number().positive().optional(),
  priceSqm: z.number().positive().optional(),
  status: apartmentStatusSchema.optional(),
});

export const updateApartmentSchema = z.object({
  buildingId: z.number().int().positive().optional(),
  apartmentNo: z.string().min(1).max(50).optional(),
  apartmentName: z.string().max(255).optional().nullable().or(z.literal('').transform(() => null)),
  apartmentType: z.number().int().optional(),
  floor: z.number().int().optional().nullable(),
  status: apartmentStatusSchema.optional(),
  dealDate: z.string().date().optional().nullable().or(z.literal('').transform(() => null)),
  ownershipName: z.string().max(500).optional().nullable().or(z.literal('').transform(() => null)),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('').transform(() => null)),
  passportTaxNo: z.string().max(100).optional().nullable().or(z.literal('').transform(() => null)),
  phone: z.string().max(50).optional().nullable().or(z.literal('').transform(() => null)),
  sqm: z.union([z.number().positive(), z.null()]).optional(),
  priceSqm: z.union([z.number().positive(), z.null()]).optional(),
  salesType: salesTypeSchema.optional(),
  totalPaid: z.number().min(0).optional().nullable(),
  dealDescription: z.string().max(500).optional().nullable().or(z.literal('').transform(() => null)),
  matterLink: z.string().url('Invalid URL').optional().nullable().or(z.literal('').transform(() => null)),
  floorplanDistribution: z.string().max(500).optional().nullable().or(z.literal('').transform(() => null)),
  exteriorLink: z.string().url('Invalid URL').optional().nullable().or(z.literal('').transform(() => null)),
  exteriorLink2: z.string().url('Invalid URL').optional().nullable().or(z.literal('').transform(() => null)),
  buyerAddress: z.string().max(1000).optional().nullable().or(z.literal('').transform(() => null)),
  otherBuyers: z.string().max(1000).optional().nullable().or(z.literal('').transform(() => null)),
  paymentSchedule: z.string().max(2000).optional().nullable().or(z.literal('').transform(() => null)),
  balanceRemaining: z.union([z.number().min(0), z.null()]).optional(),
  notes: z.string().max(2000).optional().nullable().or(z.literal('').transform(() => null)),
});

export const updateApartmentStatusSchema = z.object({
  status: apartmentStatusSchema.or(
    z.enum(['upcoming', 'available', 'reserved', 'sold']).transform((val) =>
      val.toUpperCase() as 'UPCOMING' | 'AVAILABLE' | 'RESERVED' | 'SOLD'
    )
  ),
  deal_date: z.string().date().optional().nullable().or(z.literal('').transform(() => null)),
  ownership_name: z.string().max(500).optional().nullable().or(z.literal('').transform(() => null)),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('').transform(() => null)),
  passport_tax_no: z.string().max(100).optional().nullable().or(z.literal('').transform(() => null)),
  phone: z.string().max(50).optional().nullable().or(z.literal('').transform(() => null)),
  // Поля, доступные для изменения через внешний API
  sales_type: salesTypeSchema
    .or(
      z.enum(['unsold', 'mortgage', 'cash', 'timebased']).transform((val) =>
        val.toUpperCase() as 'UNSOLD' | 'MORTGAGE' | 'CASH' | 'TIMEBASED'
      )
    )
    .optional(),
  // Query string / JSON may send numbers as strings (e.g. price_sqm=700000.0)
  price_sqm: z.preprocess(
    (v) => {
      if (v === '' || v === null || v === undefined) return undefined;
      if (typeof v === 'string') {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : v;
      }
      return v;
    },
    z.union([z.number().min(0), z.null()]).optional()
  ),
  total_paid: z.preprocess(
    (v) => {
      if (v === '' || v === null || v === undefined) return undefined;
      if (typeof v === 'string') {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : v;
      }
      return v;
    },
    z.union([z.number().min(0), z.null()]).optional()
  ),
  buyer_address: z.string().max(1000).optional().nullable().or(z.literal('').transform(() => null)),
  other_buyers: z.string().max(1000).optional().nullable().or(z.literal('').transform(() => null)),
  payment_schedule: z.string().max(2000).optional().nullable().or(z.literal('').transform(() => null)),
  deal_description: z.string().max(2000).optional().nullable().or(z.literal('').transform(() => null)),
  apartment_name: z.string().max(255).optional().nullable().or(z.literal('').transform(() => null)),
});

const userRoleSchema = z.enum(['ADMIN', 'SALES']);
const userStatusSchema = z.enum(['ACTIVE', 'DISABLED']);
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const EMAIL_MAX_LENGTH = 320;
const PAYMENT_METHOD_MAX_LENGTH = 100;
const PAYMENT_NOTE_MAX_LENGTH = 1000;
const PAYMENT_AMOUNT_MAX = 9_999_999_999.99;

export const createUserSchema = z.object({
  email: z.string().email().max(EMAIL_MAX_LENGTH),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
  role: userRoleSchema,
});

export const updateUserSchema = z.object({
  email: z.string().email().max(EMAIL_MAX_LENGTH).optional(),
  password: z
    .union([z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH), z.literal('')])
    .optional()
    .transform((value) => (value ? value : undefined)),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
});

export const externalAuthSchema = z.object({
  email: z.string().email().max(EMAIL_MAX_LENGTH),
  password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
});

const emptyToNull = z.literal('').transform(() => null);

export const createPaymentSchema = z.object({
  amount: z.number().positive().max(PAYMENT_AMOUNT_MAX),
  paidAt: z.string().date(),
  method: z.string().max(PAYMENT_METHOD_MAX_LENGTH).optional().nullable().or(emptyToNull),
  note: z.string().max(PAYMENT_NOTE_MAX_LENGTH).optional().nullable().or(emptyToNull),
});
