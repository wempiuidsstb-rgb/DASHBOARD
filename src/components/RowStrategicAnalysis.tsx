import React from 'react';
import { RowDashboardMetrics, RowRecord } from '../types';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Award,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Scissors,
  TreePine,
  Target,
  ArrowUpRight,
  Info,
  Lightbulb,
  FileCheck2,
} from 'lucide-react';

interface RowStrategicAnalysisProps {
  metrics: RowDashboardMetrics;
  records: RowRecord[];
  onSelectUlp?: (ulp: string) => void;
  onSelectTim?: (tim: string) => void;
}

export const RowStrategicAnalysis: React.FC<RowStrategicAnalysisProps> = ({
  metrics,
  records,
  onSelectUlp,
  onSelectTim,
}) => {
  // Key derived calculations
  const totalKms = metrics.totalRampalKms;
  const totalBtg = metrics.totalTebangBtg;
  const totalGiat = metrics.totalKegiatan;

  // Rasio tebang per KMS
  const tebangPerKmsRatio = totalKms > 0 ? (totalBtg / totalKms).toFixed(2) : '0';

  // ULP Rankings
  const topUlpKms = metrics.ulpStats[0];
  const topUlpBtg = [...metrics.ulpStats].sort((a, b) => b.btg - a.btg)[0];

  // Tim Productivity
  const timEfficiency = metrics.timStats.map((t) => ({
    ...t,
    kmsPerGiat: t.count > 0 ? Number((t.kms / t.count).toFixed(2)) : 0,
    btgPerGiat: t.count > 0 ? Number((t.btg / t.count).toFixed(1)) : 0,
  }));

  const topEfficientTimKms = [...timEfficiency].sort((a, b) => b.kmsPerGiat - a.kmsPerGiat)[0];

  // Hotspot Section
  const top1Section = metrics.topSections[0];

  return (
    <div className="space-y-6">
      {/* Executive Summary Header */}
      <div className="bento-card bg-linear-to-br from-slate-900 via-emerald-950 to-slate-900 text-white border-none p-6 sm:p-7 relative overflow-hidden">
        <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Analisa Strategis Pemeliharaan Right-of-Way (ROW)</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Ringkasan Eksekutif & Temuan Kunci Operasional UP3 Bulukumba
        </h3>
        <p className="text-xs sm:text-sm text-emerald-100/80 mt-2 max-w-3xl leading-relaxed">
          Berdasarkan analisis terhadap {totalGiat.toLocaleString('id-ID')} log aktivitas pemeliharaan ROW,
          telah direalisasikan pembersihan jalur sepanjang{' '}
          <strong className="text-emerald-300 font-bold">
            {totalKms.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} KMS
          </strong>{' '}
          dan penebangan sebanyak{' '}
          <strong className="text-amber-300 font-bold">{totalBtg.toLocaleString('id-ID')} Batang</strong> pohon
          rawan roboh yang berpotensi menyebabkan gangguan transmisi/distribusi SUTM.
        </p>

        {/* 4 Quick Strategic Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6">
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15">
            <div className="text-[11px] font-semibold text-emerald-300 flex items-center justify-between">
              <span>Rasio Tebang / KMS</span>
              <TreePine className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-white mt-1">{tebangPerKmsRatio} <span className="text-xs font-normal text-emerald-200">btg/KMS</span></div>
            <p className="text-[11px] text-slate-300 mt-1">
              Rata-rata pohon rawan roboh ditebang per kilometer perampalan.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15">
            <div className="text-[11px] font-semibold text-emerald-300 flex items-center justify-between">
              <span>ULP Terpadat Vegetasi</span>
              <Award className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-white mt-1 truncate">
              {topUlpKms ? topUlpKms.ulp.replace('ULP ', '') : '-'}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Volume tertinggi ({topUlpKms ? `${topUlpKms.kms.toLocaleString()} KMS` : '0 KMS'}).
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15">
            <div className="text-[11px] font-semibold text-emerald-300 flex items-center justify-between">
              <span>Tim Terproduktif</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-white mt-1 truncate">
              {topEfficientTimKms ? topEfficientTimKms.tim : '-'}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Rata-rata {topEfficientTimKms ? topEfficientTimKms.kmsPerGiat : 0} KMS per giat.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15">
            <div className="text-[11px] font-semibold text-emerald-300 flex items-center justify-between">
              <span>Section Hotspot Kritis</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="text-xl font-black text-white mt-1 truncate">
              {top1Section ? top1Section.section : '-'}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              {top1Section ? `${top1Section.kms.toLocaleString()} KMS (${top1Section.count}x eksekusi)` : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: ULP Benchmarking & Tim Productivity Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Benchmarking Kinerja 7 ULP */}
        <div className="bento-card">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Matriks Kinerja & Intensitas ROW 7 Unit ULP
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluasi komparatif volume perampalan, penebangan, dan rasio kerapatan pohon
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              7 ULP Aktif
            </span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Unit ULP</th>
                  <th className="py-2.5 px-3 text-right">Rampal (KMS)</th>
                  <th className="py-2.5 px-3 text-right">Tebang (Btg)</th>
                  <th className="py-2.5 px-3 text-right">Rasio Tebang/KMS</th>
                  <th className="py-2.5 px-3 text-center">Tingkat Risiko</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.ulpStats.map((u, idx) => {
                  const ratio = u.kms > 0 ? (u.btg / u.kms).toFixed(2) : '0';
                  const isHighDensity = u.kms > 800 || u.btg > 1500;
                  const isModerate = u.kms > 400 || u.btg > 800;

                  return (
                    <tr
                      key={u.ulp}
                      onClick={() => onSelectUlp && onSelectUlp(u.ulp)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-2 px-3 font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-mono">
                          {idx + 1}
                        </span>
                        {u.ulp.replace('ULP ', '')}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">
                        {u.kms.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-amber-700">
                        {u.btg.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        {ratio}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isHighDensity
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : isModerate
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isHighDensity ? 'Intensif / Kritis' : isModerate ? 'Sedang' : 'Terkendali'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3.5 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-start gap-2 border border-slate-200/60">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p>
              <strong>Insight:</strong> ULP dengan rasio Tebang/KMS tinggi menunjukkan vegetasi pohon kayu keras
              dan pohon pelindung berdiameter besar yang memerlukan izin penebangan serta alat potong khusus (chainsaw).
            </p>
          </div>
        </div>

        {/* Produktivitas & Karakteristik Tim */}
        <div className="bento-card">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Efisiensi & Produktivitas Tim Pelaksana
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Output rata-rata per kegiatan (KMS & Batang) menurut regu kerja
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              Analisis Regu
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {timEfficiency.map((t) => (
              <div
                key={t.tim}
                onClick={() => onSelectTim && onSelectTim(t.tim)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{t.tim}</span>
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {t.percentage}% Kontribusi ({t.count.toLocaleString()} giat)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">Rampal/Giat</span>
                    <span className="font-bold text-emerald-700">{t.kmsPerGiat} KMS</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-500 text-[10px] block">Tebang/Giat</span>
                    <span className="font-bold text-amber-700">{t.btgPerGiat} btg</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg col-span-2 sm:col-span-1">
                    <span className="text-slate-500 text-[10px] block">Total Realisasi</span>
                    <span className="font-bold text-slate-800">{t.kms.toLocaleString()} KMS</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3.5 p-3 bg-indigo-50/60 rounded-xl text-xs text-indigo-900 flex items-start gap-2 border border-indigo-200/60">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              <strong>Karakteristik:</strong> Regu <strong>YANTEK</strong> menjadi tulang punggung volume kegiatan terbanyak
              untuk perampalan rutin preventif, sementara tim <strong>VOLUME BASE</strong> dan <strong>KHS</strong> fokus
              pada pembersihan lintasan jarak jauh dan penumpasan pohon rawan.
            </p>
          </div>
        </div>
      </div>

      {/* Rekomendasi Tindakan Strategis PLN */}
      <div className="bento-card bg-linear-to-r from-emerald-50 via-teal-50 to-blue-50 border-emerald-200 p-6">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>Rekomendasi Strategis & Rencana Aksi Preventif PLN UP3 Bulukumba</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px]">
                1
              </span>
              Percepatan Jadwal Berkala Pra-Musim
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fokuskan perampalan siklus 30–45 hari pada Top 10 Section Hotspot (seperti jalur penyulang utama)
              sebelum memasuki puncak musim angin kencang dan penghujan guna mencegah trip seketika.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[11px]">
                2
              </span>
              Konversi Bertahap ke Kabel A3CS/MVTIC
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Untuk jalur yang melintasi area tanaman produktif milik warga (kelapa, cengkeh, pohon buah) di mana
              izin penebangan sulit diperoleh, rekomendasikan penggantian konduktor telanjang AAAC ke kabel berisolasi.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[11px]">
                3
              </span>
              Kolaborasi & Sosialisasi Tokoh Warga
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tingkatkan koordinasi dengan Kepala Desa dan Camat setempat sebelum pelaksanaan giat penebangan pohon bahaya
              untuk meminimalisir resistensi sosial dan menjaga keandalan SAIDI/SAIFI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
