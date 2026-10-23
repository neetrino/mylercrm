import type { Prisma, SalesType } from '@prisma/client';

export function truncateUrl(url: string, maxLen = 50): string {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen - 3) + '...';
}

export type Attachment = {
  id: number;
  fileType: string;
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
};

export type AttachmentsGrouped = {
  agreement_files: Attachment[];
  floorplans_files: Attachment[];
  images_files: Attachment[];
  progress_images_files: Attachment[];
};

/** Maps API attachments into the grouped shape FileUpload expects. */
export function normalizeAttachmentsForUpload(
  attachments: Attachment[] | AttachmentsGrouped | undefined,
): AttachmentsGrouped {
  const empty = {
    agreement_files: [],
    floorplans_files: [],
    images_files: [],
    progress_images_files: [],
  };
  if (!attachments) return empty;
  if (Array.isArray(attachments)) {
    return {
      agreement_files: attachments.filter((a) => a.fileType === 'AGREEMENT'),
      floorplans_files: attachments.filter((a) => a.fileType === 'FLOORPLAN'),
      images_files: attachments.filter((a) => a.fileType === 'IMAGE'),
      progress_images_files: attachments.filter((a) => a.fileType === 'PROGRESS_IMAGE'),
    };
  }
  return attachments;
}

export type Apartment = {
  id: number;
  apartmentNo: string;
  apartmentName: string | null;
  apartmentType: number | null;
  floor: number | null;
  status: string;
  sqm: number | null;
  price_sqm: number | null;
  total_price: number | null;
  total_paid: number | null;
  balance: number | null;
  dealDate: string | null;
  ownershipName: string | null;
  email: string | null;
  passportTaxNo: string | null;
  phone: string | null;
  salesType: string;
  dealDescription: string | null;
  matterLink: string | null;
  floorplanDistribution: string | null;
  exteriorLink: string | null;
  exteriorLink2: string | null;
  buyerAddress?: string | null;
  otherBuyers?: string | null;
  paymentSchedule?: string | null;
  balanceRemaining?: number | null;
  building_name: string;
  building_slug: string;
  district_name: string;
  district_slug: string;
  updatedAt: string;
  landingToken?: string | null;
  notes?: string | null;
  in_review?: { userId: string; email: string; expiresAt: string } | null;
  attachments?: Attachment[] | AttachmentsGrouped;
};

export function getSalesTypeLabel(type: string) {
    switch (type?.toUpperCase()) {
      case 'UNSOLD':
        return 'Unsold';
      case 'MORTGAGE':
        return 'Mortgage';
      case 'CASH':
        return 'Cash';
      case 'TIMEBASED':
        return 'Time-based';
      default:
        return type || '-';
    }
}

export function getStatusColor(status: string) {
  switch (status?.toUpperCase()) {
    case 'UPCOMING':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'AVAILABLE':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'RESERVED':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'SOLD':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function buildApartmentUpdateInput(
  formData: Partial<Apartment>,
): Prisma.ApartmentUpdateInput {
      const apiData: Prisma.ApartmentUpdateInput = {};

      const parseNumber = (value: unknown): number | null => {
        if (value === null || value === undefined || value === '') return null;
        const num = typeof value === 'string' ? parseFloat(value) : Number(value);
        return Number.isNaN(num) ? null : num;
      };

      const parseString = (value: unknown): string | null => {
        if (value === null || value === undefined) return null;
        const str = String(value).trim();
        return str === '' ? null : str;
      };
      
      // Числовые поля - преобразуем в число или null (0 тоже становится null для sqm и priceSqm)
      if (formData.sqm !== undefined) {
        const sqmNum = parseNumber(formData.sqm);
        // Для sqm и priceSqm: отправляем null если значение 0, null или пустое, иначе положительное число
        apiData.sqm = (sqmNum === null || sqmNum === 0) ? null : sqmNum;
      }
      if (formData.price_sqm !== undefined) {
        const priceSqmNum = parseNumber(formData.price_sqm);
        apiData.priceSqm = (priceSqmNum === null || priceSqmNum === 0) ? null : priceSqmNum;
      }
      if (formData.floor !== undefined) {
        const floorNum = parseNumber(formData.floor);
        apiData.floor = (floorNum === null || floorNum === 0) ? null : floorNum;
      }
      if (formData.apartmentNo !== undefined) {
        apiData.apartmentNo = String(formData.apartmentNo).trim();
      }
      if (formData.apartmentName !== undefined) {
        apiData.apartmentName = parseString(formData.apartmentName);
      }
      if (formData.apartmentType !== undefined) {
        const raw = formData.apartmentType;
        const typeNum = raw == null ? null : Number(raw);
        apiData.apartmentType = typeNum !== null && !isNaN(typeNum) ? typeNum : null;
      }

      // Дата - преобразуем в формат YYYY-MM-DD (без времени)
      if (formData.dealDate !== undefined) {
        if (formData.dealDate === null || formData.dealDate === '') {
          apiData.dealDate = null;
        } else {
          // Если это ISO строка (с T и Z), извлекаем только дату
          // Если это уже YYYY-MM-DD, оставляем как есть
          let dateStr = String(formData.dealDate);
          if (dateStr.includes('T')) {
            // ISO формат: "2026-01-08T00:00:00.000Z" -> "2026-01-08"
            dateStr = dateStr.split('T')[0];
          }
          // Проверяем, что это валидный формат YYYY-MM-DD
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            apiData.dealDate = dateStr;
          } else {
            // Пытаемся преобразовать через Date
            try {
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                apiData.dealDate = date.toISOString().split('T')[0];
              } else {
                apiData.dealDate = null;
              }
            } catch {
              apiData.dealDate = null;
            }
          }
        }
      }
      
      // Текстовые поля - преобразуем пустые строки в null
      if (formData.ownershipName !== undefined) {
        apiData.ownershipName = parseString(formData.ownershipName);
      }
      if (formData.email !== undefined) {
        apiData.email = parseString(formData.email);
      }
      if (formData.phone !== undefined) {
        apiData.phone = parseString(formData.phone);
      }
      if (formData.passportTaxNo !== undefined) {
        apiData.passportTaxNo = parseString(formData.passportTaxNo);
      }
      if (formData.salesType !== undefined) {
        apiData.salesType = formData.salesType as SalesType;
      }
      if (formData.dealDescription !== undefined) {
        apiData.dealDescription = parseString(formData.dealDescription);
      }
      if (formData.matterLink !== undefined) {
        apiData.matterLink = parseString(formData.matterLink);
      }
      if (formData.exteriorLink !== undefined) {
        apiData.exteriorLink = parseString(formData.exteriorLink);
      }
      if (formData.exteriorLink2 !== undefined) {
        apiData.exteriorLink2 = parseString(formData.exteriorLink2);
      }
      if (formData.floorplanDistribution !== undefined) {
        apiData.floorplanDistribution = parseString(formData.floorplanDistribution);
      }
      if (formData.notes !== undefined) {
        apiData.notes = parseString(formData.notes);
      }
      if (formData.buyerAddress !== undefined) {
        apiData.buyerAddress = parseString(formData.buyerAddress);
      }
      if (formData.otherBuyers !== undefined) {
        apiData.otherBuyers = parseString(formData.otherBuyers);
      }
      if (formData.paymentSchedule !== undefined) {
        apiData.paymentSchedule = parseString(formData.paymentSchedule);
      }
  return apiData;
}
