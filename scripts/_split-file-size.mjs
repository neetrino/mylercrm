import fs from 'fs';
import path from 'path';

const root = process.cwd();

function readLines(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n').split('\n');
}

function write(rel, text) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, text.endsWith('\n') ? text : `${text}\n`, 'utf8');
  console.log('wrote', rel, text.split('\n').length);
}

function slice(lines, start, end) {
  return lines.slice(start - 1, end).join('\n');
}

function used(text, names) {
  return names.filter((name) => new RegExp(`\\b${name}\\b`).test(text));
}

function componentFile(name, body, propNames, extraImports) {
  const unique = [...new Set(propNames)];
  const propsType = unique.length
    ? `type ${name}Props = {\n${unique.map((n) => `  ${n}: ${propType(n)};`).join('\n')}\n};\n\n`
    : '';
  const destructure = unique.length
    ? `  const { ${unique.join(', ')} } = props;\n`
    : '';
  const propsArg = unique.length ? `props: ${name}Props` : '';
  return `'use client';\n\n${extraImports.join('\n')}\n${extraImports.length ? '\n' : ''}${propsType}export function ${name}(${propsArg}) {\n${destructure}  return (\n    <>\n${body}\n    </>\n  );\n}\n`;
}

function propType(name) {
  const map = {
    apartment: 'Apartment',
    editing: 'boolean',
    formData: 'Partial<Apartment>',
    setFormData: 'Dispatch<SetStateAction<Partial<Apartment>>>',
    apartmentId: 'number',
    refreshAfterUpload: '() => Promise<void>',
    previewUrl: 'string | null',
    setPreviewUrl: '(url: string | null) => void',
    previewOriginalUrl: 'string | null',
    setPreviewOriginalUrl: '(url: string | null) => void',
    handleCopyLandingLink: '() => void',
    landingCopied: 'boolean',
    activeTab: "'overview' | 'links'",
    setActiveTab: "(tab: 'overview' | 'links') => void",
    setEditing: '(value: boolean) => void',
    handleSave: '() => void',
    handleStatusChange: '(status: string) => void',
    apartments: 'ApartmentListRow[]',
    buildings: "(Building & { district: District; floorPlans?: { floor: number; fileUrl: string; fileName: string | null }[] })[]",
    isAdmin: 'boolean',
    handleStatusChangeList: '(id: number, status: string) => void',
    getStatusColor: '(status: string) => string',
    setPreviewModalUrl: '(url: string | null) => void',
    sortBy: 'string',
    sortOrder: "'asc' | 'desc'",
    onSort: '(field: string) => void',
    editedFields: 'EditedFields',
    listBulkEditMode: 'boolean',
    handleFieldEdit: "(id: number, field: 'apartmentNo' | 'apartmentName', value: string) => void",
    pagination: '{ page: number; limit: number; total: number; total_pages: number }',
    currentPage: 'number',
    setCurrentPage: '(page: number) => void',
    allLoaded: 'boolean',
    previewModalUrl: 'string | null',
    viewMode: "'grid' | 'list' | 'floor'",
    loadingAll: 'boolean',
    handleLoadAll: '() => void',
    setListBulkEditMode: '(value: boolean) => void',
    exitListBulkEdit: '() => void',
    hasEdits: 'boolean',
    handleBulkSave: '() => void',
    bulkSaving: 'boolean',
    bulkSaveResult: "{ type: 'success' | 'error'; message: string } | null",
    infoRows: "{ icon: string; label: string; value: string }[]",
    agreementFiles: 'LandingAttachment[]',
    floorplans: 'LandingAttachment[]',
    threeDSections: '{ label: string; url: string | null }[]',
    progressImages: 'LandingAttachment[]',
    images: 'LandingAttachment[]',
    setLightbox: "(value: { urls: string[]; index: number } | null) => void",
    scrollTo: '(id: string) => void',
    apartmentLanding: 'LandingApartment',
  };
  return map[name] ?? 'never';
}

const cardLines = readLines('components/apartments/ApartmentCard.tsx');
const cardPropCandidates = [
  'apartment', 'editing', 'formData', 'setFormData', 'apartmentId', 'refreshAfterUpload',
  'previewUrl', 'setPreviewUrl', 'previewOriginalUrl', 'setPreviewOriginalUrl',
  'handleCopyLandingLink', 'landingCopied', 'activeTab', 'setActiveTab', 'setEditing',
  'handleSave', 'handleStatusChange',
];

const cardImports = {
  overview: ["import { formatAmd } from '@/lib/formatAmd';", "import type { Dispatch, SetStateAction } from 'react';", "import type { Apartment } from './apartmentCardModel';"],
  deal: [
    "import FileUpload from './FileUpload';",
    "import type { Dispatch, SetStateAction } from 'react';",
    "import { getSalesTypeLabel, getSalesTypeValue, normalizeAttachmentsForUpload, type Apartment } from './apartmentCardModel';",
  ],
  links: [
    "import FileUpload from './FileUpload';",
    "import { getEmbedPreviewUrl } from '@/lib/getEmbedPreviewUrl';",
    "import type { Dispatch, SetStateAction } from 'react';",
    "import { normalizeAttachmentsForUpload, truncateUrl, type Apartment } from './apartmentCardModel';",
  ],
  chrome: [
    "import Link from 'next/link';",
    "import { getStatusColor, type Apartment } from './apartmentCardModel';",
  ],
  modal: ["import type { Dispatch, SetStateAction } from 'react';"],
};

function emitCardSection(file, exportName, start, end, importKey) {
  const body = slice(cardLines, start, end);
  const props = used(body, cardPropCandidates);
  write(
    file,
    componentFile(exportName, body, props, cardImports[importKey]),
  );
  return props;
}

const model = `import type { Prisma, SalesType } from '@prisma/client';

export function truncateUrl(url: string, maxLen = 50): string {
${slice(cardLines, 13, 15).replace(/^/gm, '')}
}

export type Attachment = {
${slice(cardLines, 18, 24)}
};

export type AttachmentsGrouped = {
${slice(cardLines, 27, 31)}
};

/** Maps API attachments into the grouped shape FileUpload expects. */
export function normalizeAttachmentsForUpload(
  attachments: Attachment[] | AttachmentsGrouped | undefined
): AttachmentsGrouped {
${slice(cardLines, 37, 53)}
}

export type Apartment = {
${slice(cardLines, 56, 90)}
};

${slice(cardLines, 364, 392).replace(/^  /gm, 'export ').replace(/^export const/gm, 'export function').replace(/ = \(/, '(').replace(/\) => \{/, ') {').replace(/\n  \};/g, '\n}')}

export function getStatusColor(status: string) {
${slice(cardLines, 410, 422).replace(/^  /gm, '')}
}

export function buildApartmentUpdateInput(formData: Partial<Apartment>): Prisma.ApartmentUpdateInput {
${slice(cardLines, 155, 273)}
  return apiData;
}
`;

// The sales functions were methods with `const name = () =>`. The replace above is fragile.
// Rebuild those two functions explicitly from the slice text.
const salesRaw = slice(cardLines, 364, 392);
const salesFns = salesRaw
  .replace(/^  const (getSalesType\w+) = \(([^)]*)\) => \{/gm, 'export function $1($2) {')
  .replace(/\n  \};\n/g, '\n}\n');

const modelFixed = `import type { Prisma, SalesType } from '@prisma/client';

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
${slice(cardLines, 56, 89)}
};

${salesFns}

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
${slice(cardLines, 155, 272)}
  return apiData;
}
`;

write('components/apartments/apartmentCardModel.ts', modelFixed);
emitCardSection('components/apartments/ApartmentCardChrome.tsx', 'ApartmentCardChrome', 449, 547, 'chrome');
emitCardSection('components/apartments/ApartmentOverviewSection.tsx', 'ApartmentOverviewSection', 552, 785, 'overview');
emitCardSection('components/apartments/ApartmentDealSection.tsx', 'ApartmentDealSection', 787, 1027, 'deal');
emitCardSection('components/apartments/ApartmentLinksSection.tsx', 'ApartmentLinksSection', 1034, 1187, 'links');
emitCardSection('components/apartments/ApartmentPreviewModal.tsx', 'ApartmentPreviewModal', 1191, 1244, 'modal');

console.log('card model + sections emitted');
console.log('unused model var check', model.length);
