import { GarduRecord, FilterState, DashboardMetrics } from '../types';

let cachedRecords: GarduRecord[] | null = null;

export async function fetchGarduData(): Promise<GarduRecord[]> {
  if (cachedRecords) {
    return cachedRecords;
  }

  try {
    const res = await fetch('/data/gardu_data.json');
    if (!res.ok) {
      throw new Error(`Gagal memuat data: ${res.statusText}`);
    }
    const data: GarduRecord[] = await res.json();
    cachedRecords = data;
    return data;
  } catch (err) {
    console.error('Error fetching gardu data:', err);
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
