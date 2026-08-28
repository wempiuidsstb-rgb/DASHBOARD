import React, { useState } from 'react';
import { RowDashboardMetrics } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Line,
  ComposedChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Scissors,
  TreePine,
  Calendar,
  Users,
  MapPin,
  Award,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';

interface RowChartsProps {
  metrics: RowDashboardMetrics;
  onSelectUlp?: (ulp: string) => void;
  onSelectTim?: (tim: string) => void;
}

const TIM_COLORS: Record<string, string> = {
  YANTEK: '#2563eb', // Blue
  PEGAWAI: '#4f46e5', // Indigo
  'VOLUME BASE': '#f59e0b', // Amber
  KHS: '#10b981', // Emerald
  LAINNYA: '#94a3b8', // Slate
  'TIDAK TERDEFINISI': '#cbd5e1',
};

const DEFAULT_COLOR = '#64748b';

export const RowCharts: React.FC<RowChartsProps> = ({
  metrics,
  onSelectUlp,
  onSelectTim,
}) => {
  const [chartViewFilter, setChartViewFilter] = useState<'ALL' | 'ULP' | 'TIM' | 'SECTION'>('ALL');

  // Format ULP data for charts
  const ulpChartData = metrics.ulpStats.map((item) => ({
    name: item.ulp.replace('ULP ', ''),
    fullName: item.ulp,
    rampalKms: item.kms,
    tebangBtg: item.btg,
    totalGiat: item.count,
    tebangPerKms: item.kms > 0 ? Number((item.btg / item.kms).toFixed(2)) : 0,
  }));

  // Format Tim data
  const timPieData = metrics.timStats.map((item) => ({
    name: item.tim,
    value: item.count,
    kms: item.kms,
    btg: item.btg,
    percentage: item.percentage,
    kmsPerGiat: item.count > 0 ? Number((item.kms / item.count).toFixed(2)) : 0,
    btgPerGiat: item.count > 0 ? Number((item.btg / item.count).toFixed(1)) : 0,
    color: TIM_COLORS[item.tim] || DEFAULT_COLOR,
  }));

  // Format Top Section data
  const sectionChartData = metrics.topSections.map((item) => ({
    name: item.section.length > 18 ? item.section.slice(0, 18) + '...' : item.section,
    fullName: item.section,
    ulp: item.ulp.replace('ULP ', ''),
    rampalKms: item.kms,
    tebangBtg: item.btg,
    count: item.count,
  }));

  // Radar chart data for 7 ULP
  // Normalize each metric to 0-100 scale for intuitive radar comparison
  const maxKms = Math.max(...metrics.ulpStats.map((u) => u.kms), 1);
  const maxBtg = Math.max(...metrics.ulpStats.map((u) => u.btg), 1);
  const maxCount = Math.max(...metrics.ulpStats.map((u) => u.count), 1);

  const radarData = metrics.ulpStats.map((u) => ({
    subject: u.ulp.replace('ULP ', ''),
    'Skor Rampal': Math.round((u.kms / maxKms) * 100),
    'Skor Tebang': Math.round((u.btg / maxBtg) * 100),
    'Skor Giat': Math.round((u.count / maxCount) * 100),
    kmsReal: u.kms,
    btgReal: u.btg,
    countReal: u.count,
  }));

  return (
    <div className="space-y-6">
      {/* Visual Filter Pill Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 px-2">
          <Activity className="w-4 h-4 text-slate-700" />
          <span>Tampilan Grafik:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setChartViewFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              chartViewFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Grafik (6)
          </button>
          <button
            type="button"
            onClick={() => setChartViewFilter('ULP')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              chartViewFilter === 'ULP'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Analisis ULP
          </button>
          <button
            type="button"
            onClick={() => setChartViewFilter('TIM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              chartViewFilter === 'TIM'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Produktivitas Regu
          </button>
          <button
            type="button"
            onClick={() => setChartViewFilter('SECTION')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              chartViewFilter === 'SECTION'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hotspot Section
          </button>
        </div>
      </div>

      {/* Row 1: ULP Breakdown & Monthly Trend */}
      {(chartViewFilter === 'ALL' || chartViewFilter === 'ULP') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Realisasi per ULP */}
          <div className="bento-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-700" />
                  Realisasi Rampal (KMS) & Tebang (Batang) per ULP
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbandingan volume pemangkasan dan penebangan pohon di 7 ULP
                </p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                7 ULP
              </span>
            </div>

            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ulpChartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 600 }}
                    tickFormatter={(v) => `${v}k`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 600 }}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-3 text-xs space-y-1.5 min-w-[200px]">
                            <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                              {data.fullName}
                            </div>
                            <div className="flex justify-between items-center text-slate-800">
                              <span className="flex items-center gap-1 text-slate-600 font-semibold">
                                <Scissors className="w-3.5 h-3.5 text-slate-700" /> Rampal:
                              </span>
                              <span className="font-extrabold text-slate-900">{data.rampalKms.toLocaleString()} KMS</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-800">
                              <span className="flex items-center gap-1 text-slate-600 font-semibold">
                                <TreePine className="w-3.5 h-3.5 text-amber-700" /> Tebang:
                              </span>
                              <span className="font-extrabold text-slate-900">{data.tebangBtg.toLocaleString()} Batang</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-100">
                              <span>Total Giat:</span>
                              <span className="font-bold text-slate-900">{data.totalGiat.toLocaleString()}x</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs text-slate-600 font-medium mr-2">{value}</span>
                    )}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="rampalKms"
                    name="Rampal (KMS)"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(entry) => onSelectUlp && onSelectUlp(entry.fullName)}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="tebangBtg"
                    name="Tebang (Batang)"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(entry) => onSelectUlp && onSelectUlp(entry.fullName)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tren Bulanan */}
          <div className="bento-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-700" />
                  Tren Realisasi Bulanan (Januari - Agustus)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kurva dinamis intensitas pemangkasan dan penebangan sepanjang tahun
                </p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                Bulanan
              </span>
            </div>

            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={metrics.monthlyStats}
                  margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 600 }}
                    tickFormatter={(v) => `${v}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 600 }}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-3 text-xs space-y-1.5 min-w-[190px]">
                            <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                              Bulan: {data.bulan}
                            </div>
                            <div className="flex justify-between items-center text-slate-800">
                              <span className="text-slate-600 font-semibold">Rampal (KMS):</span>
                              <span className="font-extrabold text-slate-900">{data.kms.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-800">
                              <span className="text-slate-600 font-semibold">Tebang (Batang):</span>
                              <span className="font-extrabold text-slate-900">{data.btg.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-100">
                              <span>Total Giat:</span>
                              <span className="font-bold text-slate-900">{data.count.toLocaleString()}x</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs text-slate-600 font-medium mr-2">{value}</span>
                    )}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="kms"
                    name="Rampal (KMS)"
                    fill="#dbeafe"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="btg"
                    name="Tebang (Batang)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#f59e0b' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Row 2: Radar Profiling 7 ULP & Tim Efficiency */}
      {(chartViewFilter === 'ALL' || chartViewFilter === 'ULP' || chartViewFilter === 'TIM') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart: Profil Keseimbangan ROW 7 ULP */}
          <div className="bento-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-700" />
                  Profil Keseimbangan Beban ROW 7 ULP (Radar Chart)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualisasi normalisasi multi-dimensi (Rampal, Tebang, & Frekuensi Kegiatan)
                </p>
              </div>
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300">
                Multi-Dimensi
              </span>
            </div>

            <div className="h-72 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }} />
                  <Radar
                    name="Skor Rampal"
                    dataKey="Skor Rampal"
                    stroke="#059669"
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Skor Tebang"
                    dataKey="Skor Tebang"
                    stroke="#d97706"
                    fill="#f59e0b"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Skor Giat"
                    dataKey="Skor Giat"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.25}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs text-slate-800 font-semibold mr-2">{value}</span>
                    )}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-3 text-xs space-y-1.5 min-w-[190px]">
                            <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                              ULP {d.subject}
                            </div>
                            <div className="flex justify-between text-slate-800">
                              <span className="text-slate-600 font-semibold">Realisasi Rampal:</span>
                              <span className="font-extrabold text-slate-900">{d.kmsReal.toLocaleString()} KMS</span>
                            </div>
                            <div className="flex justify-between text-slate-800">
                              <span className="text-slate-600 font-semibold">Pohon Tebang:</span>
                              <span className="font-extrabold text-slate-900">{d.btgReal.toLocaleString()} Batang</span>
                            </div>
                            <div className="flex justify-between text-slate-800">
                              <span className="text-slate-600 font-semibold">Total Kegiatan:</span>
                              <span className="font-extrabold text-slate-900">{d.countReal.toLocaleString()}x</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Produktivitas Rata-rata per Kegiatan per Tim */}
          <div className="bento-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-700" />
                  Produktivitas Rata-rata per Kegiatan (KMS/Giat)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Efisiensi perampalan rata-rata yang dicapai regu dalam sekali turun ke lapangan
                </p>
              </div>
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300">
                Efisiensi Regu
              </span>
            </div>

            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timPieData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 600 }} unit=" KMS" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 700 }}
                    width={80}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-3 text-xs space-y-1.5 min-w-[200px]">
                            <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                              Tim: {data.name}
                            </div>
                            <div className="flex justify-between items-center text-slate-800">
                              <span className="text-slate-600 font-semibold">Output per Giat:</span>
                              <span className="font-extrabold text-slate-900">{data.kmsPerGiat} KMS/giat</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-800">
                              <span className="text-slate-600 font-semibold">Tebang per Giat:</span>
                              <span className="font-extrabold text-slate-900">{data.btgPerGiat} btg/giat</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-100">
                              <span>Total Realisasi:</span>
                              <span className="font-bold text-slate-900">{data.kms.toLocaleString()} KMS</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="kmsPerGiat"
                    name="KMS per Giat"
                    fill="#334155"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Row 3: Tim Pie Distribution & Top 10 Sections */}
      {(chartViewFilter === 'ALL' || chartViewFilter === 'TIM' || chartViewFilter === 'SECTION') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kontribusi Tim */}
          <div className="bento-card lg:col-span-1">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-700" />
                  Distribusi Tim Pelaksana
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Persentase eksekusi kegiatan ROW</p>
              </div>
            </div>

            <div className="h-56 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {timPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-2.5 text-xs space-y-1 min-w-[170px]">
                            <div className="font-bold text-slate-900">{data.name}</div>
                            <div className="flex justify-between text-slate-700">
                              <span>Kegiatan:</span>
                              <span className="font-bold text-slate-900">{data.value.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-700">
                              <span>Porsi:</span>
                              <span className="font-extrabold text-slate-900">{data.percentage}%</span>
                            </div>
                            <div className="flex justify-between text-slate-700">
                              <span>Rampal:</span>
                              <span className="font-extrabold text-slate-900">{data.kms.toLocaleString()} KMS</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Tim Breakdown List */}
            <div className="space-y-2 mt-2 pt-2 border-t border-slate-100">
              {timPieData.map((t) => (
                <div
                  key={t.name}
                  onClick={() => onSelectTim && onSelectTim(t.name)}
                  className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }}></span>
                    <span className="font-bold text-slate-900">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">{t.value.toLocaleString()} giat</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                      {t.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 Section Rawan / Intensif */}
          <div className="bento-card lg:col-span-2">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-700" />
                  Top 10 Jalur / Section Paling Intensif ROW
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Section penyulang dengan volume pembersihan jaringan transmisi/distribusi tertinggi
                </p>
              </div>
              <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg">
                KMS Tertinggi
              </span>
            </div>

            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectionChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 600 }} unit=" KMS" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 600 }}
                    width={100}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-3 text-xs space-y-1.5 min-w-[210px]">
                            <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                              {data.fullName}
                            </div>
                            <div className="text-slate-600 font-medium">Unit: {data.ulp}</div>
                            <div className="flex justify-between items-center text-slate-800">
                              <span className="text-slate-600 font-semibold">Panjang Rampal:</span>
                              <span className="font-extrabold text-slate-900">{data.rampalKms.toLocaleString()} KMS</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-800">
                              <span className="text-slate-600 font-semibold">Pohon Ditebang:</span>
                              <span className="font-extrabold text-slate-900">{data.tebangBtg.toLocaleString()} Batang</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-100">
                              <span>Frekuensi Eksekusi:</span>
                              <span className="font-bold text-slate-900">{data.count.toLocaleString()} Kali</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="rampalKms"
                    name="Rampal (KMS)"
                    fill="#059669"
                    radius={[0, 4, 4, 0]}
                    barSize={14}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
