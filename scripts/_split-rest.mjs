import fs from 'fs';
import path from 'path';

const root = process.cwd();

function readLines(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n').split('\n');
}

function write(rel, text) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  const body = text.replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(full, body.endsWith('\n') ? body : `${body}\n`, 'utf8');
  console.log(rel, body.trimEnd().split('\n').length);
}

function slice(lines, start, end) {
  return lines.slice(start - 1, end).join('\n');
}

function unindent(text, spaces) {
  const prefix = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => (line.startsWith(prefix) ? line.slice(spaces) : line))
    .join('\n');
}

function serviceImports(chunk) {
  const lines = [];
  if (/\bprisma\b/.test(chunk)) lines.push("import { prisma } from '@/lib/prisma';");
  const types = ['Apartment', 'ApartmentStatus'].filter((name) => new RegExp(`\\b${name}\\b`).test(chunk));
  if (/\bPrisma\b/.test(chunk)) lines.push("import { Prisma } from '@prisma/client';");
  if (types.length) lines.push(`import type { ${types.join(', ')} } from '@prisma/client';`);
  if (/\bcrypto\b/.test(chunk)) lines.push("import crypto from 'crypto';");
  const bulk = [
    'assertNoExternalApartmentNoConflict',
    'assertUniqueApartmentNosInBatch',
    'buildBulkTempApartmentNo',
    'mergeBulkApartmentRows',
  ].filter((name) => chunk.includes(name));
  if (bulk.length) {
    lines.push(`import {\n  ${bulk.join(',\n  ')},\n} from '@/lib/apartmentBulkUpdate';`);
  }
  return lines.join('\n');
}

function extractMethod(lines, start, endInclusiveClose, exportName) {
  const raw = lines.slice(start - 1, endInclusiveClose);
  if (!/^\s*\},?\s*$/.test(raw[raw.length - 1])) {
    throw new Error(`method ${exportName} does not end at ${endInclusiveClose}: ${raw[raw.length - 1]}`);
  }
  raw.pop();
  const asyncIndex = raw.findIndex((line) => /async \w+/.test(line));
  if (asyncIndex < 0) throw new Error(`no async in ${exportName}`);
  raw[asyncIndex] = raw[asyncIndex].replace(/async \w+/, `export async function ${exportName}`);
  const body = unindent(raw.join('\n'), 2);
  return `${serviceImports(body)}\n\n${body}\n`;
}

const service = readLines('services/apartment.service.ts');
write('services/apartment/listApartments.ts', extractMethod(service, 13, 223, 'listApartments'));
write('services/apartment/getApartmentById.ts', extractMethod(service, 225, 321, 'getApartmentById'));
const writeBodies = [
  [323, 384, 'createApartment'],
  [386, 416, 'updateApartment'],
  [418, 433, 'updateApartmentStatus'],
  [435, 439, 'deleteApartment'],
].map(([start, end, name]) => extractMethod(service, start, end, name).replace(/^import[\s\S]*?\n\n/, ''));
write(
  'services/apartment/apartmentWrites.ts',
  `${serviceImports(writeBodies.join('\n'))}\n\n${writeBodies.join('\n')}`,
);
const landingA = extractMethod(service, 441, 527, 'getByLandingToken');
const landingB = extractMethod(service, 576, 590, 'ensureLandingToken').replace(/^import[\s\S]*?\n\n/, '');
write('services/apartment/landingApartment.ts', `${landingA.trimEnd()}\n\n${landingB}`);
write('services/apartment/bulkUpdateApartments.ts', extractMethod(service, 529, 574, 'bulkUpdateApartments'));

write(
  'services/apartment.service.ts',
  `import { createApartment, deleteApartment, updateApartment, updateApartmentStatus } from './apartment/apartmentWrites';
import { bulkUpdateApartments } from './apartment/bulkUpdateApartments';
import { getApartmentById } from './apartment/getApartmentById';
import { ensureLandingToken, getByLandingToken } from './apartment/landingApartment';
import { listApartments } from './apartment/listApartments';

export const apartmentService = {
  getAll: listApartments,
  getById: getApartmentById,
  create: createApartment,
  update: updateApartment,
  updateStatus: updateApartmentStatus,
  delete: deleteApartment,
  getByLandingToken,
  bulkUpdate: bulkUpdateApartments,
  ensureLandingToken,
};
`,
);

const excel = readLines('scripts/import-from-excel.ts');
const helpers = slice(excel, 27, 140)
  .replace(/^function /gm, 'export function ')
  .replace(/^const /gm, 'export const ')
  .replace(/^type /gm, 'export type ');
write(
  'scripts/excelImportParse.ts',
  `import * as XLSX from 'xlsx';

${helpers}
`,
);
const excelMain = [
  slice(excel, 1, 25),
  '',
  `import {`,
  `  cell,`,
  `  getSheet,`,
  `  mapSalesType,`,
  `  mapStatus,`,
  `  normalizeSlug,`,
  `  num,`,
  `  str,`,
  `  parseDate,`,
  `  type Row,`,
  `} from './excelImportParse';`,
  '',
  slice(excel, 142, excel.length),
].join('\n');
write('scripts/import-from-excel.ts', excelMain);

const form = readLines('components/buildings/BuildingForm.tsx');
write(
  'components/buildings/buildingFormTypes.ts',
  `import type { Building, District } from '@prisma/client';

export type FloorPlan = { id: number; floor: number; fileUrl: string; fileName: string | null };

export type BuildingWithDistrict = Building & {
  district: District;
  floorPlans?: FloorPlan[];
  floorsCount?: number | null;
};
`,
);

const handlers = slice(form, 110, 146)
  .replaceAll('building?.id', 'buildingId')
  .replaceAll('building.id', 'buildingId')
  .replaceAll('setFullBuilding(', 'onUpdated(');
write(
  'components/buildings/BuildingFloorPlans.tsx',
  `'use client';

import { useRef, useState } from 'react';
import type { BuildingWithDistrict, FloorPlan } from './buildingFormTypes';

type BuildingFloorPlansProps = {
  buildingId: number;
  floorsNum: number;
  floorPlans: FloorPlan[];
  onUpdated: (data: BuildingWithDistrict) => void;
};

export function BuildingFloorPlans({
  buildingId,
  floorsNum,
  floorPlans,
  onUpdated,
}: BuildingFloorPlansProps) {
  const [uploadingFloor, setUploadingFloor] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
${handlers}
  const getPlanForFloor = (f: number) => floorPlans.find((p) => p.floor === f);

  return (
${slice(form, 255, 336)}
  );
}
`,
);

const formNext = [
  `'use client';`,
  ``,
  `import { useEffect, useState } from 'react';`,
  `import Link from 'next/link';`,
  `import { useRouter } from 'next/navigation';`,
  `import type { District } from '@prisma/client';`,
  `import { BuildingFloorPlans } from './BuildingFloorPlans';`,
  `import type { BuildingWithDistrict } from './buildingFormTypes';`,
  ``,
  slice(form, 16, 47).replace('interface BuildingFormProps {', 'type BuildingFormProps = {').replace('}', '};').replace(/\/\*\* When true[\s\S]*?\*\/\n  standalone\?: boolean;\n/, '  standalone?: boolean;\n'),
].join('\n');

// Rebuild form more carefully from original lines instead of the fragile header above.
const formBody = [
  slice(form, 25, 47),
  slice(form, 51, 109),
  slice(form, 148, 149),
  slice(form, 152, 253),
  `          {building && floorsNum > 0 && (`,
  `            <BuildingFloorPlans`,
  `              buildingId={building.id}`,
  `              floorsNum={floorsNum}`,
  `              floorPlans={floorPlans}`,
  `              onUpdated={setFullBuilding}`,
  `            />`,
  `          )}`,
  slice(form, 338, form.length),
].join('\n');

write(
  'components/buildings/BuildingForm.tsx',
  `'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { District } from '@prisma/client';
import { BuildingFloorPlans } from './BuildingFloorPlans';
import type { BuildingWithDistrict } from './buildingFormTypes';

type BuildingFormProps = {
  building: BuildingWithDistrict | null;
  districts: District[];
  onClose?: () => void;
  onSuccess?: () => void;
  standalone?: boolean;
};

${formBody}
`,
);

const upload = readLines('components/apartments/FileUpload.tsx');
const grids = [slice(upload, 133, 233), '', slice(upload, 234, 277)].join('\n');
const gridsExported = grids
  .replace(
    '  const isImageFileName = (fileName: string | null): boolean => {',
    'export function isImageFileName(fileName: string | null): boolean {',
  )
  .replace(
    '  const renderDocumentGrid = (files: Attachment[], _type: string) => {',
    'export function renderDocumentGrid(\n  files: Attachment[],\n  _type: string,\n  onOpen: (value: { urls: string[]; index: number }) => void,\n  onDelete: (id: number) => void,\n) {',
  )
  .replace(
    '  const renderImageGrid = (files: Attachment[], _type: string) => {',
    'export function renderImageGrid(\n  files: Attachment[],\n  _type: string,\n  onOpen: (value: { urls: string[]; index: number }) => void,\n  onDelete: (id: number) => void,\n) {',
  )
  .replaceAll('setLightbox(', 'onOpen(')
  .replaceAll('handleDelete(', 'onDelete(')
  .replace(/^  /gm, '');

write(
  'components/apartments/FileAttachmentGrids.tsx',
  `'use client';

import { FileText } from 'lucide-react';
import Image from 'next/image';

type Attachment = {
  id: number;
  fileType: string;
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  createdAt: string;
};

${gridsExported}
`,
);

const uploadNext = [
  slice(upload, 1, 6).replace("import { FileText } from 'lucide-react';\nimport Image from 'next/image';\n", ''),
  `import { renderDocumentGrid, renderImageGrid } from './FileAttachmentGrids';`,
  '',
  slice(upload, 8, 132),
  slice(upload, 279, 284).replace(
    '  ) => {',
    '  ) => {',
  ),
].join('\n');

const renderFileList = slice(upload, 279, 328)
  .replace(
    'return renderImageGrid(files, fileType);',
    'return renderImageGrid(files, fileType, setLightbox, handleDelete);',
  )
  .replace(
    'return renderDocumentGrid(files, fileType);',
    'return renderDocumentGrid(files, fileType, setLightbox, handleDelete);',
  );

write(
  'components/apartments/FileUpload.tsx',
  `'use client';

import { useState } from 'react';
import ImageLightbox from '@/components/ui/ImageLightbox';
import { renderDocumentGrid, renderImageGrid } from './FileAttachmentGrids';

${slice(upload, 8, 132)}

${renderFileList}

${slice(upload, 330, upload.length)}
`,
);

const landing = readLines('components/landing/LandingView.tsx');
write(
  'components/landing/landingTypes.ts',
  `${slice(landing, 8, 38)}
`,
);
const sectionBody = slice(landing, 197, 416);
const sectionImports = ["'use client';", ''];
if (sectionBody.includes('formatAmd')) sectionImports.push("import { formatAmd } from '@/lib/formatAmd';");
if (sectionBody.includes('getIframeSrc')) sectionImports.push("import { getIframeSrc } from '@/lib/getEmbedPreviewUrl';");
sectionImports.push("import type { Attachment, LandingApartment } from './landingTypes';");
write(
  'components/landing/LandingSections.tsx',
  `${sectionImports.join('\n')}

type LandingSectionsProps = {
  apartment: LandingApartment;
  infoRows: { icon: string; label: string; value: string }[];
  agreementFiles: Attachment[];
  floorplans: Attachment[];
  threeDSections: { label: string; url: string | null }[];
  progressImages: Attachment[];
  images: Attachment[];
  setLightbox: (value: { urls: string[]; index: number } | null | ((prev: { urls: string[]; index: number } | null) => { urls: string[]; index: number } | null)) => void;
  scrollTo: (id: string) => void;
};

export function LandingSections(props: LandingSectionsProps) {
  const {
    apartment,
    infoRows,
    agreementFiles,
    floorplans,
    threeDSections,
    progressImages,
    images,
    setLightbox,
    scrollTo,
  } = props;

  return (
    <>
${sectionBody}
    </>
  );
}
`,
);

const parentUses = `${slice(landing, 40, 196)}\n${slice(landing, 417, landing.length)}`;
const landingHead = `'use client';

import { useEffect, useState } from 'react';
import ImageLightbox from '@/components/ui/ImageLightbox';
${parentUses.includes('formatAmd') ? "import { formatAmd } from '@/lib/formatAmd';\n" : ''}${parentUses.includes('getIframeSrc') ? "import { getIframeSrc } from '@/lib/getEmbedPreviewUrl';\n" : ''}`;
write(
  'components/landing/LandingView.tsx',
  `${landingHead}import { LandingSections } from './LandingSections';
import type { LandingApartment } from './landingTypes';

${slice(landing, 40, 196)}
        <LandingSections
          apartment={apartment}
          infoRows={infoRows}
          agreementFiles={agreementFiles}
          floorplans={floorplans}
          threeDSections={threeDSections}
          progressImages={progressImages}
          images={images}
          setLightbox={setLightbox}
          scrollTo={scrollTo}
        />
${slice(landing, 417, landing.length)}
`,
);

const list = readLines('components/apartments/ApartmentsList.tsx');
const types = readLines('components/apartments/apartmentListTypes.ts').join('\n');
if (!types.includes('EditedFields')) {
  write(
    'components/apartments/apartmentListTypes.ts',
    `${types.trimEnd()}

export type ApartmentEdit = { apartmentNo?: string; apartmentName?: string | null };
export type EditedFields = Record<number, ApartmentEdit>;
`,
  );
}

const fetchBlock = slice(list, 254, 281).replace(
  `      setLoading(true);
      setAllLoaded(false);
      setEditedFields({});
      setListBulkEditMode(false);`,
  `      setLoading(true);
      bulkResetRef.current?.();`,
).replace(
  '}, [sortBy, sortOrder, selectedBuilding, selectedStatus, searchQuery]);',
  '}, [sortBy, sortOrder, selectedBuilding, selectedStatus, searchQuery, bulkResetRef]);',
);

write(
  'components/apartments/useApartmentsCatalog.ts',
  `'use client';

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { useSession } from 'next-auth/react';
import type { Building, District } from '@prisma/client';
import type { ApartmentListRow } from './apartmentListTypes';

const APARTMENTS_VIEW_MODE_KEY = 'maylercrm:apartmentsViewMode';

export function useApartmentsCatalog(
  bulkResetRef: MutableRefObject<(() => void) | null>,
) {
${slice(list, 35, 59)}

${slice(list, 200, 253)}
${fetchBlock}
${slice(list, 283, 339)}

${slice(list, 362, 437)}

  return {
    apartments,
    setApartments,
    buildings,
    loading,
    error,
    setError,
    selectedBuilding,
    setSelectedBuilding,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    searchInput,
    setSearchInput,
    showForm,
    setShowForm,
    currentPage,
    setCurrentPage,
    viewMode,
    setViewMode,
    sortBy,
    sortOrder,
    pagination,
    setPagination,
    previewModalUrl,
    setPreviewModalUrl,
    exportLoading,
    isAdmin,
    handleExportExcel,
    fetchApartments,
    handleSort,
    handleStatusChange,
    getStatusColor,
  };
}
`,
);

write(
  'components/apartments/useApartmentsBulk.ts',
  `'use client';

import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type { ApartmentListRow, EditedFields } from './apartmentListTypes';

type Pagination = { page: number; limit: number; total: number; total_pages: number };

type UseApartmentsBulkArgs = {
  apartments: ApartmentListRow[];
  setApartments: Dispatch<SetStateAction<ApartmentListRow[]>>;
  setError: Dispatch<SetStateAction<string>>;
  setPagination: Dispatch<SetStateAction<Pagination>>;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedBuilding: number | null;
  selectedStatus: string;
  searchQuery: string;
};

export function useApartmentsBulk(args: UseApartmentsBulkArgs) {
  const {
    apartments,
    setApartments,
    setError,
    setPagination,
    sortBy,
    sortOrder,
    selectedBuilding,
    selectedStatus,
    searchQuery,
  } = args;

${slice(list, 61, 198)}

  const reset = useCallback(() => {
    setAllLoaded(false);
    setEditedFields({});
    setListBulkEditMode(false);
  }, []);

  return {
    loadingAll,
    allLoaded,
    editedFields,
    bulkSaving,
    bulkSaveResult,
    listBulkEditMode,
    setListBulkEditMode,
    hasEdits,
    exitListBulkEdit,
    handleFieldEdit,
    handleBulkSave,
    handleLoadAll,
    reset,
  };
}
`,
);

write(
  'components/apartments/ViewModeButton.tsx',
  `'use client';

import type { ReactNode } from 'react';

${slice(list, 1051, list.length).replace(/^function /, 'export function ')}
`,
);

write(
  'components/apartments/ApartmentsFloorView.tsx',
  `'use client';

import Link from 'next/link';
import type { Building, District } from '@prisma/client';
import { ApartmentCardItem } from './ApartmentCardItem';
import type { ApartmentListRow } from './apartmentListTypes';

type ApartmentsFloorViewProps = {
  apartments: ApartmentListRow[];
  buildings: (Building & { district: District })[];
  isAdmin: boolean;
  handleStatusChange: (id: number, status: string) => void;
  getStatusColor: (status: string) => string;
  setPreviewModalUrl: (url: string | null) => void;
};

export function ApartmentsFloorView({
  apartments,
  buildings,
  isAdmin,
  handleStatusChange,
  getStatusColor,
  setPreviewModalUrl,
}: ApartmentsFloorViewProps) {
${slice(list, 686, 786)}
}
`,
);

write(
  'components/apartments/ApartmentsTable.tsx',
  `'use client';

import Link from 'next/link';
import { DropdownSelect } from '@/components/ui/DropdownSelect';
import { formatAmd } from '@/lib/formatAmd';
import { APARTMENT_STATUS_OPTIONS } from './apartmentStatusOptions';
import type { ApartmentListRow, EditedFields } from './apartmentListTypes';

type ApartmentsTableProps = {
  apartments: ApartmentListRow[];
  editedFields: EditedFields;
  listBulkEditMode: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  handleFieldEdit: (id: number, field: 'apartmentNo' | 'apartmentName', value: string) => void;
  handleStatusChange: (id: number, status: string) => void;
  getStatusColor: (status: string) => string;
};

export function ApartmentsTable(props: ApartmentsTableProps) {
  const {
    apartments,
    editedFields,
    listBulkEditMode,
    sortBy,
    sortOrder,
    onSort,
    handleFieldEdit,
    handleStatusChange,
    getStatusColor,
  } = props;

  const SortableHeader = ({ field, label, align = 'left' }: { field: string; label: string; align?: 'left' | 'right' }) => {
    const isActive = sortBy === field;
    return (
      <th
        className={\`px-6 py-3 text-\${align} text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer select-none hover:bg-gray-100 transition-colors\`}
        onClick={() => onSort(field)}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <span className="text-gray-400">
            {isActive ? (
              sortOrder === 'asc' ? '↑' : '↓'
            ) : (
              <span className="text-gray-300">⇅</span>
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <>
${slice(list, 803, 905)}
    </>
  );
}
`,
);

write(
  'components/apartments/ApartmentsPagination.tsx',
  `'use client';

type ApartmentsPaginationProps = {
  pagination: { page: number; limit: number; total: number; total_pages: number };
  currentPage: number;
  setCurrentPage: (page: number) => void;
  allLoaded: boolean;
};

export function ApartmentsPagination(props: ApartmentsPaginationProps) {
  const { pagination, currentPage, setCurrentPage, allLoaded } = props;
  return (
    <>
${slice(list, 908, 1009)}
    </>
  );
}
`,
);

write(
  'components/apartments/ApartmentsPreviewModal.tsx',
  `'use client';

type ApartmentsPreviewModalProps = {
  previewModalUrl: string | null;
  setPreviewModalUrl: (url: string | null) => void;
};

export function ApartmentsPreviewModal(props: ApartmentsPreviewModalProps) {
  const { previewModalUrl, setPreviewModalUrl } = props;
  return (
    <>
${slice(list, 1011, 1046)}
    </>
  );
}
`,
);

write(
  'components/apartments/ApartmentsBulkBar.tsx',
  `'use client';

import { AlertCircle, CheckCircle2, Layers, Loader2, Save, SquarePen, X } from 'lucide-react';

type ApartmentsBulkBarProps = {
  viewMode: 'grid' | 'list' | 'floor';
  loadingAll: boolean;
  allLoaded: boolean;
  apartments: { length: number };
  pagination: { total: number };
  handleLoadAll: () => void;
  listBulkEditMode: boolean;
  setListBulkEditMode: (value: boolean) => void;
  exitListBulkEdit: () => void;
  hasEdits: boolean;
  handleBulkSave: () => void;
  bulkSaving: boolean;
  bulkSaveResult: { type: 'success' | 'error'; message: string } | null;
};

export function ApartmentsBulkBar(props: ApartmentsBulkBarProps) {
  const {
    viewMode,
    loadingAll,
    allLoaded,
    apartments,
    pagination,
    handleLoadAll,
    listBulkEditMode,
    setListBulkEditMode,
    exitListBulkEdit,
    hasEdits,
    handleBulkSave,
    bulkSaving,
    bulkSaveResult,
  } = props;
  return (
    <>
${slice(list, 537, 623)}
    </>
  );
}
`,
);

write(
  'components/apartments/ApartmentsList.tsx',
  `'use client';

import { useRef } from 'react';
import { Building2, FileSpreadsheet, LayoutGrid, List as ListIcon } from 'lucide-react';
import ApartmentForm from './ApartmentForm';
import { ApartmentCardItem } from './ApartmentCardItem';
import { ApartmentsBulkBar } from './ApartmentsBulkBar';
import { ApartmentsFilters } from './ApartmentsFilters';
import { ApartmentsFloorView } from './ApartmentsFloorView';
import { ApartmentsPagination } from './ApartmentsPagination';
import { ApartmentsPreviewModal } from './ApartmentsPreviewModal';
import { ApartmentsTable } from './ApartmentsTable';
import { ViewModeButton } from './ViewModeButton';
import { useApartmentsBulk } from './useApartmentsBulk';
import { useApartmentsCatalog } from './useApartmentsCatalog';

export default function ApartmentsList() {
  const bulkResetRef = useRef<(() => void) | null>(null);
  const catalog = useApartmentsCatalog(bulkResetRef);
  const bulk = useApartmentsBulk({
    apartments: catalog.apartments,
    setApartments: catalog.setApartments,
    setError: catalog.setError,
    setPagination: catalog.setPagination,
    sortBy: catalog.sortBy,
    sortOrder: catalog.sortOrder,
    selectedBuilding: catalog.selectedBuilding,
    selectedStatus: catalog.selectedStatus,
    searchQuery: catalog.searchQuery,
  });
  bulkResetRef.current = bulk.reset;

  const {
    apartments,
    buildings,
    loading,
    error,
    selectedBuilding,
    setSelectedBuilding,
    selectedStatus,
    setSelectedStatus,
    searchInput,
    setSearchInput,
    showForm,
    setShowForm,
    currentPage,
    setCurrentPage,
    viewMode,
    setViewMode,
    sortBy,
    sortOrder,
    pagination,
    previewModalUrl,
    setPreviewModalUrl,
    exportLoading,
    isAdmin,
    handleExportExcel,
    fetchApartments,
    handleSort,
    handleStatusChange,
    getStatusColor,
  } = catalog;
  const {
    loadingAll,
    allLoaded,
    editedFields,
    bulkSaving,
    bulkSaveResult,
    listBulkEditMode,
    setListBulkEditMode,
    hasEdits,
    exitListBulkEdit,
    handleFieldEdit,
    handleBulkSave,
    handleLoadAll,
  } = bulk;

  if (loading && apartments.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="text-sm text-gray-600">Loading apartments...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
${slice(list, 451, 536)}
      <ApartmentsBulkBar
        viewMode={viewMode}
        loadingAll={loadingAll}
        allLoaded={allLoaded}
        apartments={apartments}
        pagination={pagination}
        handleLoadAll={handleLoadAll}
        listBulkEditMode={listBulkEditMode}
        setListBulkEditMode={setListBulkEditMode}
        exitListBulkEdit={exitListBulkEdit}
        hasEdits={hasEdits}
        handleBulkSave={handleBulkSave}
        bulkSaving={bulkSaving}
        bulkSaveResult={bulkSaveResult}
      />
${slice(list, 625, 682)}
      ) : viewMode === 'floor' ? (
        <ApartmentsFloorView
          apartments={apartments}
          buildings={buildings}
          isAdmin={isAdmin}
          handleStatusChange={handleStatusChange}
          getStatusColor={getStatusColor}
          setPreviewModalUrl={setPreviewModalUrl}
        />
${slice(list, 788, 800)}
      ) : (
        <ApartmentsTable
          apartments={apartments}
          editedFields={editedFields}
          listBulkEditMode={listBulkEditMode}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          handleFieldEdit={handleFieldEdit}
          handleStatusChange={handleStatusChange}
          getStatusColor={getStatusColor}
        />
${slice(list, 906, 907)}
      <ApartmentsPagination
        pagination={pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        allLoaded={allLoaded}
      />
      <ApartmentsPreviewModal
        previewModalUrl={previewModalUrl}
        setPreviewModalUrl={setPreviewModalUrl}
      />
    </div>
  );
}
`,
);

console.log('done');
