import { GarduRecord, FilterState, DashboardMetrics, LoadStatus } from '../types';
import Papa from 'papaparse';

const GOOGLE_SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1yKABzadJ3umWnIG0d6vR8y4mZ3LopnU9GssvJf7_N18/gviz/tq?tqx=out:csv&sheet=FORM';
const BACKUP_LOCAL_JSON_URL = '/data/gardu_data.json';

let cachedRecords: GarduRecord[] | null = null;
let lastDataSource: 'live_google_sheets_csv' | 'local_cache' = 'live_google_sheets_csv';

export function getLastDataSource(): 'live_google_sheets_csv' | 'local_cache' {
  return lastDataSource;
}

function parseIndoNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/%/g, '').replace(/\s/g, '').replace(/,/g, '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseCoords(longlatStr: any): { lat: number | null; lng: number | null } {
  if (!longlatStr) return { lat: null, lng: null };
  const str = String(longlatStr).trim();
  if (!str || str.toLowerCase() === 'null' || str === '-') return { lat: null, lng: null };

  const parts = str.split(',');
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  return { lat: null, lng: null };
}

function determineLoadStatus(indexStatus: any, bebanPct: number): LoadStatus {
  const s = String(indexStatus || '').trim().toUpperCase();
  if (s.includes('OVERLOAD') || s === 'OVER') return 'OVERLOAD';
  if (s.includes('UNDERLOAD') || s === 'UNDER') return 'UNDERLOAD';
  if (s.includes('NORMAL')) return 'NORMAL';

  if (bebanPct > 80) return 'OVERLOAD';
  if (bebanPct < 40) return 'UNDERLOAD';
  return 'NORMAL';
}

function normalizeUlp(ulpRaw: string): string {
  const trimmed = ulpRaw.trim().toUpperCase();
  if (!trimmed) return '';
  if (trimmed.startsWith('ULP ')) return trimmed;
  return `ULP ${trimmed}`;
}

export function parseGoogleSheetsCsv(csvText: string): GarduRecord[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
  });

  const rows = parsed.data;
  const records: GarduRecord[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const gardu = String(row['NAMA GARDU'] || row['Nama Gardu'] || '').trim();
    if (!gardu) continue; // skip empty rows

    const coords = parseCoords(row['LONGLAT'] || row['Longlat'] || row['Koordinat']);
    const bebanPct = parseIndoNumber(row['% PEMBEBANAN'] || row['% Pembebanan']);
    const unbalancePct = parseIndoNumber(row['%UNBALANCE'] || row['% UNBALANCE'] || row['%Unbalance']);
    const statusBeban = determineLoadStatus(row['INDEX PEMBEBANAN TRAFO'] || row['Index Pembebanan'], bebanPct);
    const id = String(row['ID'] || '').trim() || `gardu-${i}-${gardu}`;
    const ulpRaw = String(row['ULP'] || row['Ulp'] || '').trim();

    records.push({
      id,
      timestamp: String(row['TIMESTAMP'] || '').trim(),
      date: String(row['TANGGAL'] || '').trim(),
      gardu,
      up3: String(row['UP3'] || 'UP3 BULUKUMBA').trim(),
      ulp: normalizeUlp(ulpRaw),
      penyulang: String(row['PENYULANG'] || '').trim(),
      zona: String(row['ZONA PROTEKSI'] || '').trim(),
      section: String(row['SECTION'] || '').trim(),
      kapasitas: parseIndoNumber(row['KAPASITAS']),
      fasa: parseIndoNumber(row['FASA']) || 3,
      lat: coords.lat,
      lng: coords.lng,
      ir: parseIndoNumber(row['IR']),
      is: parseIndoNumber(row['IS']),
      it: parseIndoNumber(row['IT']),
      in: parseIndoNumber(row['IN']),
      vfn: parseIndoNumber(row['VFN']),
      vff: parseIndoNumber(row['VFF']),
      beban_kva: parseIndoNumber(row['PEMBILANG PEMBEBANAN']),
      beban_pct: Math.round(bebanPct * 10) / 10,
      unbalance_pct: Math.round(unbalancePct * 10) / 10,
      avg_i: parseIndoNumber(row['AVG Irst']),
      status_beban: statusBeban,
      kebocoran_minyak: String(row['(1) KEBOCORAN MINYAK TRAFO'] || '').trim(),
      kondisi_fisik: String(row['(2) KONDISI FISIK TRAFO'] || '').trim(),
      pembumian: parseIndoNumber(row['(3) PEMBUMIAN TRAFO']),
      kesesuaian_ampere: String(row['(4) KESESUAIAN AMPERE TRAFO'] || '').trim(),
      kondisi_lvsb: String(row['(5) KONDISI LVSB/PHBTR'] || '').trim(),
      arrester: String(row['(6) ARRESTER'] || '').trim(),
      fco: String(row['(7) FCO'] || '').trim(),
      petugas: String(row['NAMA PENGINPUT'] || '').trim(),
      keterangan: String(row['KETERANGAN'] || '').trim(),
      progress: String(row['PROGRESS'] || '').trim(),
      tipe: String(row['KHUSUS / UMUM'] || 'UMUM').trim(),
    });
  }

  return records;
}

export async function fetchGarduData(forceRefresh = false): Promise<GarduRecord[]> {
  if (!forceRefresh && cachedRecords && cachedRecords.length > 0) {
    return cachedRecords;
  }

  // 1. Fetch CSV directly from Google Sheets (handles 5,000+ rows without JSON truncation)
  try {
    const res = await fetch(GOOGLE_SHEETS_CSV_URL, {
      cache: forceRefresh ? 'reload' : 'default',
    });

    if (res.ok) {
      const csvText = await res.text();
      if (csvText && csvText.includes('NAMA GARDU')) {
        const records = parseGoogleSheetsCsv(csvText);
        if (records.length > 0) {
          cachedRecords = records;
          lastDataSource = 'live_google_sheets_csv';
          return records;
        }
      }
    }
    console.warn('Google Sheets CSV response did not contain expected data, falling back to local copy...');
  } catch (err) {
    console.warn('Google Sheets CSV fetch error, falling back to local dataset:', err);
  }

  // 2. Fallback to local dataset if offline or network failure
  try {
    const res = await fetch(BACKUP_LOCAL_JSON_URL);
    if (!res.ok) {
      throw new Error(`Gagal memuat data lokal: ${res.statusText}`);
    }
    const data: GarduRecord[] = await res.json();
    cachedRecords = data;
    lastDataSource = 'local_cache';
    return data;
  } catch (err) {
    console.error('Fatal: Gagal memuat data gardu:', err);
    throw err;
  }
}

export function filterRecords(records: GarduRecord[], filters: FilterState): GarduRecord[] {
  return records.filter((rec) => {
    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      const matchGardu = rec.gardu.toLowerCase().includes(q);
      const matchPenyulang = rec.penyulang.toLowerCase().includes(q);
      const matchUlp = rec.ulp.toLowerCase().includes(q);
      const matchPetugas = rec.petugas.toLowerCase().includes(q);
      const matchSection = rec.section.toLowerCase().includes(q);
      if (!matchGardu && !matchPenyulang && !matchUlp && !matchPetugas && !matchSection) {
        return false;
      }
    }

    // ULP filter
    if (filters.ulp && filters.ulp !== 'ALL') {
      if (rec.ulp !== filters.ulp) return false;
    }

    // Penyulang filter
    if (filters.penyulang && filters.penyulang !== 'ALL') {
      if (rec.penyulang !== filters.penyulang) return false;
    }

    // Status Beban
    if (filters.status && filters.status !== 'ALL') {
      if (rec.status_beban !== filters.status) return false;
    }

    // Kapasitas
    if (filters.kapasitas && filters.kapasitas !== 'ALL') {
      const capNum = parseFloat(filters.kapasitas);
      if (Math.round(rec.kapasitas) !== Math.round(capNum)) return false;
    }

    // Only with GPS coords
    if (filters.onlyWithCoords) {
      if (rec.lat === null || rec.lng === null) return false;
    }

    // Grounding Anomaly (> 5 Ohm)
    if (filters.groundingAnomaly) {
      if (rec.pembumian <= 5) return false;
    }

    // High Unbalance (> 25%)
    if (filters.highUnbalance) {
      if (rec.unbalance_pct <= 25) return false;
    }

    return true;
  });
}

export function calculateMetrics(records: GarduRecord[]): DashboardMetrics {
  const total = records.length;
  if (total === 0) {
    return {
      total: 0,
      withCoords: 0,
      overload: 0,
      normal: 0,
      underload: 0,
      avgBeban: 0,
      avgUnbalance: 0,
      groundingCompliant: 0,
      groundingNonCompliant: 0,
      ulpStats: {},
    };
  }

  let withCoords = 0;
  let overload = 0;
  let normal = 0;
  let underload = 0;
  let sumBeban = 0;
  let sumUnbalance = 0;
  let groundingCompliant = 0;
  let groundingNonCompliant = 0;
  const ulpStats: Record<string, { total: number; overload: number; normal: number; underload: number }> = {};

  for (const rec of records) {
    if (rec.lat !== null && rec.lng !== null) withCoords++;

    if (rec.status_beban === 'OVERLOAD') overload++;
    else if (rec.status_beban === 'UNDERLOAD') underload++;
    else normal++;

    sumBeban += rec.beban_pct || 0;
    sumUnbalance += rec.unbalance_pct || 0;

    if (rec.pembumian > 0) {
      if (rec.pembumian <= 5) groundingCompliant++;
      else groundingNonCompliant++;
    }

    const ulpKey = rec.ulp || 'LAINNYA';
    if (!ulpStats[ulpKey]) {
      ulpStats[ulpKey] = { total: 0, overload: 0, normal: 0, underload: 0 };
    }
    ulpStats[ulpKey].total++;
    if (rec.status_beban === 'OVERLOAD') ulpStats[ulpKey].overload++;
    else if (rec.status_beban === 'UNDERLOAD') ulpStats[ulpKey].underload++;
    else ulpStats[ulpKey].normal++;
  }

  return {
    total,
    withCoords,
    overload,
    normal,
    underload,
    avgBeban: Math.round((sumBeban / total) * 10) / 10,
    avgUnbalance: Math.round((sumUnbalance / total) * 10) / 10,
    groundingCompliant,
    groundingNonCompliant,
    ulpStats,
  };
}

export function exportToCSV(records: GarduRecord[], filename = 'data_pengukuran_gardu.csv') {
  const headers = [
    'Nama Gardu',
    'ULP',
    'Penyulang',
    'Kapasitas (kVA)',
    'Fasa',
    'Beban (%)',
    'Unbalance (%)',
    'Status Beban',
    'Arus R (A)',
    'Arus S (A)',
    'Arus T (A)',
    'Arus N (A)',
    'VFN (V)',
    'VFF (V)',
    'Pembumian (Ohm)',
    'Latitude',
    'Longitude',
    'Petugas',
    'Tanggal',
  ];

  const csvRows = [headers.join(',')];

  for (const r of records) {
    const row = [
      `"${r.gardu}"`,
      `"${r.ulp}"`,
      `"${r.penyulang}"`,
      r.kapasitas,
      r.fasa,
      r.beban_pct,
      r.unbalance_pct,
      `"${r.status_beban}"`,
      r.ir,
      r.is,
      r.it,
      r.in,
      r.vfn,
      r.vff,
      r.pembumian,
      r.lat ?? '',
      r.lng ?? '',
      `"${r.petugas}"`,
      `"${r.date}"`,
    ];
    csvRows.push(row.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
