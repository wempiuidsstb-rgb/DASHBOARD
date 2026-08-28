import Papa from 'papaparse';
import { RowRecord, RowFilterState, RowDashboardMetrics } from '../types';

const ROW_SPREADSHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1YIGLc3v75FXULTpIElPoTkisL1Lef_rXvxUp_nV2YQA/gviz/tq?tqx=out:csv&gid=1881629360';
const BACKUP_LOCAL_ROW_JSON_URL = '/data/row_rekap_up3.json';

let cachedRowRecords: RowRecord[] | null = null;
let lastRowDataSource: 'live_google_sheets_csv' | 'local_cache' = 'live_google_sheets_csv';

export function getLastRowDataSource(): 'live_google_sheets_csv' | 'local_cache' {
  return lastRowDataSource;
}

function parseIndoNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/%/g, '').replace(/\s/g, '').replace(/,/g, '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function normalizeUlp(raw: string): string {
  const trimmed = (raw || '').trim().toUpperCase();
  if (!trimmed) return '';
  if (trimmed.startsWith('ULP ')) return trimmed;
  return `ULP ${trimmed}`;
}

export function parseRowCsv(csvText: string): RowRecord[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
  });

  const rows = parsed.data;
  const records: RowRecord[] = [];
  let idCounter = 1;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const tgl = String(row['TANGGAL'] || row['Tanggal'] || '').trim();
    const ulp = String(row['ULP'] || row['Ulp'] || '').trim();
    const sec = String(row['SECTION'] || row['Section'] || '').trim();
    const rampalStr = row['RAMPAL (KMS)'] || row['Rampal (KMS)'] || row['RAMPAL'] || '';
    const tebangStr = row['TEBANG (btg)'] || row['Tebang (btg)'] || row['TEBANG'] || '';
    let tim = String(row['TIM '] || row['TIM'] || row['Tim'] || '').trim();

    // Skip blank template rows
    if (!sec && !rampalStr && !tebangStr && !tim) continue;

    const rampal = parseIndoNumber(rampalStr);
    const tebang = parseIndoNumber(tebangStr);

    if (tim === '#REF!') tim = 'LAINNYA';
    if (!tim) tim = 'TIDAK TERDEFINISI';

    records.push({
      id: `row-${idCounter++}`,
      tanggal: tgl,
      ulp: normalizeUlp(ulp),
      ulpRaw: ulp,
      section: sec || 'Jaringan SUTM/JTR',
      rampalKms: Math.round(rampal * 100) / 100,
      tebangBtg: Math.round(tebang),
      tim,
    });
  }

  return records;
}

export async function fetchRowData(forceRefresh = false): Promise<RowRecord[]> {
  if (!forceRefresh && cachedRowRecords && cachedRowRecords.length > 0) {
    return cachedRowRecords;
  }

  // 1. Live stream CSV from Google Sheets REKAP UP3
  try {
    const res = await fetch(ROW_SPREADSHEET_CSV_URL, {
      cache: forceRefresh ? 'reload' : 'default',
    });

    if (res.ok) {
      const csvText = await res.text();
      if (csvText && (csvText.includes('RAMPAL') || csvText.includes('TEBANG') || csvText.includes('SECTION'))) {
        const records = parseRowCsv(csvText);
        if (records.length > 0) {
          cachedRowRecords = records;
          lastRowDataSource = 'live_google_sheets_csv';
          return records;
        }
      }
    }
    console.warn('Google Sheets REKAP UP3 CSV response unexpected, trying local backup...');
  } catch (err) {
    console.warn('Google Sheets REKAP UP3 fetch error, using local fallback:', err);
  }

  // 2. Local fallback json
  try {
    const res = await fetch(BACKUP_LOCAL_ROW_JSON_URL);
    if (!res.ok) {
      throw new Error(`Gagal memuat dataset lokal ROW: ${res.statusText}`);
    }
    const data: RowRecord[] = await res.json();
    cachedRowRecords = data;
    lastRowDataSource = 'local_cache';
    return data;
  } catch (err) {
    console.error('Fatal: Gagal memuat data REKAP UP3:', err);
    throw err;
  }
}

export function filterRowRecords(records: RowRecord[], filters: RowFilterState): RowRecord[] {
  const searchLower = filters.search.trim().toLowerCase();

  return records.filter((r) => {
    // Search
    if (searchLower) {
      const matchSearch =
        r.section.toLowerCase().includes(searchLower) ||
        r.ulp.toLowerCase().includes(searchLower) ||
        r.ulpRaw.toLowerCase().includes(searchLower) ||
        r.tanggal.toLowerCase().includes(searchLower) ||
        r.tim.toLowerCase().includes(searchLower);
      if (!matchSearch) return false;
    }

    // ULP filter
    if (filters.ulp && filters.ulp !== 'ALL') {
      const target = filters.ulp.toUpperCase().replace(/^ULP\s+/, '');
      const itemUlp = r.ulpRaw.toUpperCase().replace(/^ULP\s+/, '');
      if (itemUlp !== target) return false;
    }

    // Tim filter
    if (filters.tim && filters.tim !== 'ALL') {
      if (r.tim.toUpperCase() !== filters.tim.toUpperCase()) return false;
    }

    // Bulan filter
    if (filters.bulan && filters.bulan !== 'ALL') {
      if (!r.tanggal.toLowerCase().includes(filters.bulan.toLowerCase())) return false;
    }

    // Activity type filter
    if (filters.activityType === 'RAMPAL_ONLY') {
      if (r.rampalKms <= 0 || r.tebangBtg > 0) return false;
    } else if (filters.activityType === 'TEBANG_ONLY') {
      if (r.tebangBtg <= 0 || r.rampalKms > 0) return false;
    } else if (filters.activityType === 'BOTH') {
      if (r.rampalKms <= 0 || r.tebangBtg <= 0) return false;
    }

    return true;
  });
}

const MONTH_ORDER = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function calculateRowMetrics(records: RowRecord[]): RowDashboardMetrics {
  let totalRampal = 0;
  let totalTebang = 0;

  const ulpMap: Record<string, { kms: number; btg: number; count: number }> = {};
  const timMap: Record<string, { count: number; kms: number; btg: number }> = {};
  const monthMap: Record<string, { kms: number; btg: number; count: number }> = {};
  const sectionMap: Record<string, { section: string; ulp: string; kms: number; btg: number; count: number }> = {};

  for (const r of records) {
    totalRampal += r.rampalKms;
    totalTebang += r.tebangBtg;

    // ULP
    const ulpKey = r.ulp || 'LAINNYA';
    if (!ulpMap[ulpKey]) ulpMap[ulpKey] = { kms: 0, btg: 0, count: 0 };
    ulpMap[ulpKey].kms += r.rampalKms;
    ulpMap[ulpKey].btg += r.tebangBtg;
    ulpMap[ulpKey].count++;

    // Tim
    const timKey = r.tim || 'LAINNYA';
    if (!timMap[timKey]) timMap[timKey] = { count: 0, kms: 0, btg: 0 };
    timMap[timKey].count++;
    timMap[timKey].kms += r.rampalKms;
    timMap[timKey].btg += r.tebangBtg;

    // Month
    let monthFound = 'Lainnya';
    for (const m of MONTH_ORDER) {
      if (r.tanggal.toLowerCase().includes(m.toLowerCase())) {
        monthFound = m;
        break;
      }
    }
    if (!monthMap[monthFound]) monthMap[monthFound] = { kms: 0, btg: 0, count: 0 };
    monthMap[monthFound].kms += r.rampalKms;
    monthMap[monthFound].btg += r.tebangBtg;
    monthMap[monthFound].count++;

    // Section
    const secKey = `${r.section}__${r.ulp}`;
    if (!sectionMap[secKey]) {
      sectionMap[secKey] = { section: r.section, ulp: r.ulp, kms: 0, btg: 0, count: 0 };
    }
    sectionMap[secKey].kms += r.rampalKms;
    sectionMap[secKey].btg += r.tebangBtg;
    sectionMap[secKey].count++;
  }

  // ULP Stats array
  const ulpStats = Object.entries(ulpMap)
    .map(([ulp, val]) => ({
      ulp,
      kms: Math.round(val.kms * 100) / 100,
      btg: val.btg,
      count: val.count,
    }))
    .sort((a, b) => b.kms - a.kms);

  // Tim Stats array
  const totalCount = records.length || 1;
  const timStats = Object.entries(timMap)
    .map(([tim, val]) => ({
      tim,
      count: val.count,
      kms: Math.round(val.kms * 100) / 100,
      btg: val.btg,
      percentage: Math.round((val.count / totalCount) * 1000) / 10,
    }))
    .sort((a, b) => b.count - a.count);

  // Monthly stats sorted chronologically
  const monthlyStats = MONTH_ORDER.filter((m) => monthMap[m] !== undefined).map((m) => ({
    bulan: m,
    kms: Math.round(monthMap[m].kms * 100) / 100,
    btg: monthMap[m].btg,
    count: monthMap[m].count,
  }));

  // Add "Lainnya" if exists
  if (monthMap['Lainnya']) {
    monthlyStats.push({
      bulan: 'Lainnya',
      kms: Math.round(monthMap['Lainnya'].kms * 100) / 100,
      btg: monthMap['Lainnya'].btg,
      count: monthMap['Lainnya'].count,
    });
  }

  // Top 10 Sections
  const topSections = Object.values(sectionMap)
    .map((s) => ({
      ...s,
      kms: Math.round(s.kms * 100) / 100,
    }))
    .sort((a, b) => b.kms - a.kms)
    .slice(0, 10);

  return {
    totalKegiatan: records.length,
    totalRampalKms: Math.round(totalRampal * 100) / 100,
    totalTebangBtg: totalTebang,
    avgRampalPerKegiatan: records.length ? Math.round((totalRampal / records.length) * 100) / 100 : 0,
    avgTebangPerKegiatan: records.length ? Math.round((totalTebang / records.length) * 10) / 10 : 0,
    ulpStats,
    timStats,
    monthlyStats,
    topSections,
  };
}

export function exportRowToCSV(records: RowRecord[], filename = 'rekap_row_up3.csv'): void {
  const headers = ['NO', 'TANGGAL', 'ULP', 'SECTION / PENYULANG', 'RAMPAL (KMS)', 'TEBANG (BATANG)', 'TIM PELAKSANA'];
  const rows = records.map((r, i) => [
    i + 1,
    `"${r.tanggal}"`,
    `"${r.ulp}"`,
    `"${r.section}"`,
    r.rampalKms.toFixed(2),
    r.tebangBtg,
    `"${r.tim}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
