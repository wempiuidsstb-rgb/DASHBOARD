import React, { useMemo } from 'react';
import { GarduRecord } from '../types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Activity, Zap, ShieldAlert, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AnalyticsViewProps {
  records: GarduRecord[];
  onSelectGardu: (gardu: GarduRecord) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ records, onSelectGardu }) => {
  // 1. Status Beban Data
  const statusData = useMemo(() => {
    let ov = 0, nm = 0, un = 0;
    records.forEach((r) => {
      if (r.status_beban === 'OVERLOAD') ov++;
      else if (r.status_beban === 'UNDERLOAD') un++;
      else nm++;
    });
    return [
      { name: 'Overload (>80%)', value: ov, color: '#ef4444' },
      { name: 'Normal (40-80%)', value: nm, color: '#10b981' },
      { name: 'Underload (<40%)', value: un, color: '#3b82f6' },
    ];
  }, [records]);

  // 2. Beban per ULP Data
  const ulpData = useMemo(() => {
    const map: Record<string, { ulp: string; Overload: number; Normal: number; Underload: number; total: number }> = {};
    records.forEach((r) => {
      const u = r.ulp.replace('ULP ', '') || 'Lainnya';
      if (!map[u]) {
        map[u] = { ulp: u, Overload: 0, Normal: 0, Underload: 0, total: 0 };
      }
      map[u].total++;
      if (r.status_beban === 'OVERLOAD') map[u].Overload++;
      else if (r.status_beban === 'UNDERLOAD') map[u].Underload++;
      else map[u].Normal++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [records]);

  // 3. Kapasitas Trafo Data
  const capacityData = useMemo(() => {
    const map: Record<number, { kapasitas: string; capNum: number; total: number; overload: number }> = {};
    records.forEach((r) => {
      const cap = Math.round(r.kapasitas);
      if (!map[cap]) {
        map[cap] = { kapasitas: `${cap} kVA`, capNum: cap, total: 0, overload: 0 };
      }
      map[cap].total++;
      if (r.status_beban === 'OVERLOAD') map[cap].overload++;
    });
    return Object.values(map)
      .filter((c) => c.capNum > 0)
      .sort((a, b) => a.capNum - b.capNum);
  }, [records]);

  // 4. Unbalance Breakdown
  const unbalanceData = useMemo(() => {
    let b1 = 0, b2 = 0, b3 = 0, b4 = 0;
    records.forEach((r) => {
      const u = r.unbalance_pct;
      if (u <= 10) b1++;
      else if (u <= 20) b2++;
      else if (u <= 30) b3++;
      else b4++;
    });
    return [
      { range: '0 - 10% (Sangat Baik)', count: b1, color: '#10b981' },
      { range: '10 - 20% (Standar PLN)', count: b2, color: '#3b82f6' },
      { range: '20 - 30% (Waspada)', count: b3, color: '#f59e0b' },
      { range: '> 30% (Kritis)', count: b4, color: '#ef4444' },
    ];
  }, [records]);

  // 5. Kepatuhan Grounding
  const groundingData = useMemo(() => {
    let compliant = 0;
    let nonCompliant = 0;
    let noData = 0;
    records.forEach((r) => {
      if (r.pembumian <= 0) noData++;
      else if (r.pembumian <= 5) compliant++;
      else nonCompliant++;
    });
    return [
      { name: 'Sesuai Standar (<= 5 Ohm)', value: compliant, color: '#10b981' },
      { name: 'Tidak Sesuai (> 5 Ohm)', value: nonCompliant, color: '#ef4444' },
      { name: 'Belum Terukur', value: noData, color: '#94a3b8' },
    ];
  }, [records]);

  // 6. Top 5 Gardu Paling Kritis (Overload tertinggi)
  const topOverload = useMemo(() => {
    return [...records]
      .filter((r) => r.beban_pct > 0)
      .sort((a, b) => b.beban_pct - a.beban_pct)
      .slice(0, 5);
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Overview Cards Row - Bento Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bento-card flex-row items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="stat-label text-red-600">Tingkat Overload Wilayah</span>
            <div className="stat-value text-red-600 mt-0.5">
              {records.length > 0
                ? Math.round((records.filter((r) => r.status_beban === 'OVERLOAD').length / records.length) * 100)
                : 0}
              %
            </div>
            <div className="text-xs text-slate-500 mt-1">
              <strong className="text-red-600 font-semibold">
                {records.filter((r) => r.status_beban === 'OVERLOAD').length.toLocaleString()} unit
              </strong>{' '}
              melebihi kapasitas nominal
            </div>
          </div>
        </div>

        <div className="bento-card flex-row items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="stat-label text-amber-600">Rata-Rata Unbalance Beban</span>
            <div className="stat-value text-amber-600 mt-0.5">
              {records.length > 0
                ? (records.reduce((acc, r) => acc + r.unbalance_pct, 0) / records.length).toFixed(1)
                : 0}
              %
            </div>
            <div className="text-xs text-slate-500 mt-1">Ambang batas standar SPLN adalah &le; 20%</div>
          </div>
        </div>

        <div className="bento-card flex-row items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="stat-label text-emerald-600">Kepatuhan Pembumian (Arde)</span>
            <div className="stat-value text-emerald-600 mt-0.5">
              {records.length > 0
                ? Math.round(
                    (records.filter((r) => r.pembumian > 0 && r.pembumian <= 5).length /
                      records.filter((r) => r.pembumian > 0).length || 1) * 100
                  )
                : 0}
              %
            </div>
            <div className="text-xs text-slate-500 mt-1">Tahanan pentanahan memenuhi syarat &le; 5 &Omega;</div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart: Komposisi Beban */}
        <div className="lg:col-span-5 bento-card justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Komposisi Status Beban Trafo</h2>
            <p className="text-xs text-slate-500 mt-0.5">Proporsi gardu overload, normal, dan underload</p>
          </div>

          <div className="h-64 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString()} Gardu`, 'Jumlah']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
            {statusData.map((s) => (
              <div key={s.name} className="px-2 py-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="stat-label text-[10px] truncate">{s.name.split(' ')[0]}</div>
                <div className="text-lg font-extrabold mt-0.5" style={{ color: s.color }}>
                  {s.value.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {records.length > 0 ? Math.round((s.value / records.length) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stacked Bar Chart: Distribusi per ULP */}
        <div className="lg:col-span-7 bento-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Sebaran Beban per Unit Layanan Pelanggan (ULP)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Komparasi jumlah gardu overload vs normal per ULP</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ulpData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="ulp" tick={{ fontSize: 11, fill: '#64748b' }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Overload" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Normal" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Underload" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kapasitas Trafo vs Overload */}
        <div className="bento-card">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Distribusi Kapasitas Trafo & Jumlah Overload</h2>
            <p className="text-xs text-slate-500 mt-0.5">Jumlah gardu dan tingkat beban berlebih pada setiap rating daya</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capacityData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="kapasitas" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="total" name="Total Gardu" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overload" name="Overload" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribusi Unbalance Beban */}
        <div className="bento-card">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Ketidakseimbangan Beban Antar Fasa (% Unbalance)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ketidakseimbangan tinggi memicu arus netral besar dan losses jaringan</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unbalanceData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748b' }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" name="Jumlah Gardu" radius={[6, 6, 0, 0]}>
                  {unbalanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 5 Critical Gardu Table - Bento Card */}
      <div className="bento-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>5 Gardu dengan Pembebanan Tertinggi (Prioritas Penanganan)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Gardu-gardu dengan risiko trip dan kerusakan transformator paling tinggi</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Nama Gardu</th>
                <th className="py-2.5 px-3">ULP</th>
                <th className="py-2.5 px-3">Penyulang</th>
                <th className="py-2.5 px-3 text-right">Kapasitas</th>
                <th className="py-2.5 px-3 text-right">% Pembebanan</th>
                <th className="py-2.5 px-3 text-right">% Unbalance</th>
                <th className="py-2.5 px-3 text-right">Arus R / S / T</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topOverload.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{g.gardu}</td>
                  <td className="py-3 px-3 text-slate-600">{g.ulp}</td>
                  <td className="py-3 px-3 text-slate-600">{g.penyulang}</td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-700">{g.kapasitas} kVA</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                      {g.beban_pct}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700">{g.unbalance_pct}%</td>
                  <td className="py-3 px-3 text-right text-slate-500">
                    {g.ir} / {g.is} / {g.it} A
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onSelectGardu(g)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 rounded-lg font-semibold transition-all"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
