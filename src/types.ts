export type LoadStatus = 'OVERLOAD' | 'NORMAL' | 'UNDERLOAD';

export interface GarduRecord {
  id: string;
  timestamp: string;
  date: string;
  gardu: string;
  up3: string;
  ulp: string;
  penyulang: string;
  zona: string;
  section: string;
  kapasitas: number; // kVA
  fasa: number; // 1 or 3
  lat: number | null;
  lng: number | null;
  ir: number; // Ampere
  is: number;
  it: number;
  in: number;
  vfn: number; // Volt
  vff: number;
  beban_kva: number;
  beban_pct: number; // e.g. 110.5 for 110.5%
  unbalance_pct: number; // e.g. 25.4 for 25.4%
  avg_i: number;
  status_beban: LoadStatus;
  kebocoran_minyak: string;
  kondisi_fisik: string;
  pembumian: number; // Ohm
  kesesuaian_ampere: string;
  kondisi_lvsb: string;
  arrester: string;
  fco: string;
  petugas: string;
  keterangan: string;
  progress: string;
  tipe: string;
}

export interface FilterState {
  search: string;
  ulp: string;
  penyulang: string;
  status: string; // 'ALL' | 'OVERLOAD' | 'NORMAL' | 'UNDERLOAD'
  kapasitas: string; // 'ALL' or specific kVA
  onlyWithCoords: boolean;
  groundingAnomaly: boolean; // pembumian > 5 Ohm
  highUnbalance: boolean; // unbalance > 25%
}

export interface DashboardMetrics {
  total: number;
  withCoords: number;
  overload: number;
  normal: number;
  underload: number;
  avgBeban: number;
  avgUnbalance: number;
  groundingCompliant: number; // <= 5 Ohm
  groundingNonCompliant: number; // > 5 Ohm
  ulpStats: Record<string, { total: number; overload: number; normal: number; underload: number }>;
}

export type ActiveTab = 'map' | 'analytics' | 'table' | 'priority';

export type AppView = 'landing' | 'gardu' | 'row';

export interface RowRecord {
  id: string;
  tanggal: string;
  ulp: string;
  ulpRaw: string;
  section: string;
  rampalKms: number;
  tebangBtg: number;
  tim: string;
}

export interface RowFilterState {
  search: string;
  ulp: string;
  tim: string;
  bulan: string;
  activityType: 'ALL' | 'RAMPAL_ONLY' | 'TEBANG_ONLY' | 'BOTH';
}

export interface RowDashboardMetrics {
  totalKegiatan: number;
  totalRampalKms: number;
  totalTebangBtg: number;
  avgRampalPerKegiatan: number;
  avgTebangPerKegiatan: number;
  ulpStats: { ulp: string; kms: number; btg: number; count: number }[];
  timStats: { tim: string; count: number; kms: number; btg: number; percentage: number }[];
  monthlyStats: { bulan: string; kms: number; btg: number; count: number }[];
  topSections: { section: string; ulp: string; kms: number; btg: number; count: number }[];
}
