import * as XLSX from 'xlsx';

export function normalizeSlug(s: string): string {
  return String(s ?? '')
    .toLowerCase()
    .trim()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function num(val: unknown): number | null {
  if (val === undefined || val === null || val === '') return null;
  const n = Number(String(val).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function str(val: unknown): string | null {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  return s === '' ? null : s;
}

/** Преобразует дату: Excel serial number или строку YYYY-MM-DD → YYYY-MM-DD или null */
export function parseDate(val: unknown): string | null {
  if (val === undefined || val === null || val === '') return null;
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 1) return null;
  // Excel serial date (days since 1899-12-30)
  const date = new Date(Math.round((n - 25569) * 86400 * 1000));
  if (isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export const STATUSES = ['UPCOMING', 'AVAILABLE', 'RESERVED', 'SOLD'] as const;
export const SALES_TYPES = ['UNSOLD', 'MORTGAGE', 'CASH', 'TIMEBASED'] as const;

export type Status = (typeof STATUSES)[number];
export type SalesType = (typeof SALES_TYPES)[number];

/** Подписи из Excel (в т.ч. армянские) → enum статуса */
export const STATUS_ALIASES: Record<string, Status> = {
  Հասանելի: 'AVAILABLE',
  հասանելի: 'AVAILABLE',
  Պահված: 'RESERVED',
  պահված: 'RESERVED',
  Վաճառված: 'SOLD',
  վաճառված: 'SOLD',
  Առաջիկա: 'UPCOMING',
  առաջիկա: 'UPCOMING',
  available: 'AVAILABLE',
  reserved: 'RESERVED',
  sold: 'SOLD',
  upcoming: 'UPCOMING',
};

/** Подписи из Excel → enum типа продаж */
export const SALES_TYPE_ALIASES: Record<string, SalesType> = {
  Չվաճառված: 'UNSOLD',
  չվաճառված: 'UNSOLD',
  Վաճառք: 'CASH',
  վաճառք: 'CASH',
  Իպոտեկ: 'MORTGAGE',
  իպոտեկ: 'MORTGAGE',
  Ժամանակավոր: 'TIMEBASED',
  ժամանակավոր: 'TIMEBASED',
  unsold: 'UNSOLD',
  mortgage: 'MORTGAGE',
  cash: 'CASH',
  timebased: 'TIMEBASED',
};

export function mapStatus(raw: unknown): Status {
  const s = String(raw ?? '').trim();
  if (!s) return 'UPCOMING';
  const upper = s.toUpperCase();
  if (STATUSES.includes(upper as Status)) return upper as Status;
  const alias = STATUS_ALIASES[s] ?? STATUS_ALIASES[s.toLowerCase()];
  return alias ?? 'UPCOMING';
}

export function mapSalesType(raw: unknown): SalesType {
  const s = String(raw ?? '').trim();
  if (!s) return 'UNSOLD';
  const upper = s.toUpperCase();
  if (SALES_TYPES.includes(upper as SalesType)) return upper as SalesType;
  const alias = SALES_TYPE_ALIASES[s] ?? SALES_TYPE_ALIASES[s.toLowerCase()];
  return alias ?? 'UNSOLD';
}

export type Row = Record<string, unknown>;

/** Значение по нескольким возможным именам колонки (учитывает пробелы в конце заголовка Excel). */
export function cell(row: Row, ...names: string[]): unknown {
  for (const n of names) {
    if (n in row && row[n] !== undefined && row[n] !== '') return row[n];
  }
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const want = new Set(names.map(norm));
  for (const k of Object.keys(row)) {
    if (want.has(norm(k))) return row[k];
  }
  return undefined;
}

export function getSheet(wb: XLSX.WorkBook, nameOrIndex: string | number): Row[] {
  const sheet =
    typeof nameOrIndex === 'number'
      ? wb.Sheets[wb.SheetNames[nameOrIndex]]
      : wb.Sheets[nameOrIndex];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: undefined });
  return rows;
}
