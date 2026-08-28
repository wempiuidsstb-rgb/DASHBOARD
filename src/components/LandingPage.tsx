import React from 'react';
import { AppView, DashboardMetrics } from '../types';
import {
  Zap,
  Trees,
  ArrowRight,
  MapPin,
  BarChart3,
  AlertTriangle,
  FileSpreadsheet,
  Scissors,
  TreePine,
  ShieldCheck,
  Building2,
  Users,
  Activity,
  Layers,
  Database,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface LandingPageProps {
  onSelectView: (view: AppView) => void;
  garduMetrics: DashboardMetrics;
  garduLoading: boolean;
  rowRecordCount: number;
  rowKmsTotal: number;
  rowBtgTotal: number;
  rowLoading: boolean;
  onRefreshAll: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectView,
  garduMetrics,
  garduLoading,
  rowRecordCount,
  rowKmsTotal,
  rowBtgTotal,
  rowLoading,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Brand Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-500/25">
              PLN
            </div>
            <div>
              <div className="text-sm font-black text-white tracking-wide flex items-center gap-2">
                PT PLN (PERSERO) UID SULSELRABAR
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-md">
                  UP3 Bulukumba
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pusat Sistem Monitoring & Analitik Distribusi Ketenagalistrikan
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Google Sheets Sync
            </span>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col justify-center">
        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 shadow-inner">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sistem Informasi Terpadu Operasi & Pemeliharaan Jaringan</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Pilih Modul Dashboard Monitoring
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Silakan pilih modul dashboard di bawah ini untuk mengakses visualisasi data, peta spasial,
            analisis teknis beban gardu, atau rekapitulasi pembersihan Right-of-Way (ROW).
          </p>
        </div>

        {/* 2 Primary Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto w-full">
          {/* Card 1: Dashboard Pengukuran Gardu */}
          <div
            onClick={() => onSelectView('gardu')}
            className="group relative bg-slate-800/80 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-blue-500/80 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all pointer-events-none"></div>

            <div className="relative z-10 space-y-5">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-md">
                  <Zap className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/25">
                  MODUL 01
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                  Dashboard Pengukuran Gardu
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Monitoring beban transformator distribusi, pemetaan spasial GIS, analisis kondisi
                  overload/underload, ketidakseimbangan fasa (unbalance), dan tahanan pembumian (arde).
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Pemetaan Spasial GIS Interaktif & Kluster Gardu</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Deteksi Trafo Overload ({'>'}80%) & Prioritas Mitigasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Grafik Analitik Pembebanan & Arus Fasa R-S-T-N</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ekspor Laporan Resmi Format PDF & CSV</span>
                </div>
              </div>

              {/* Live Metric Badges */}
              <div className="grid grid-cols-3 gap-2 pt-3">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold">Total Gardu</div>
                  <div className="text-sm sm:text-base font-black text-white mt-0.5">
                    {garduLoading ? '...' : (garduMetrics.total || 5200).toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold">Overload</div>
                  <div className="text-sm sm:text-base font-black text-amber-400 mt-0.5">
                    {garduLoading ? '...' : (garduMetrics.overload || 0).toLocaleString('id-ID')}
                  </div>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold">Cakupan ULP</div>
                  <div className="text-sm sm:text-base font-black text-blue-400 mt-0.5">
                    7 Unit
                  </div>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-6 relative z-10">
              <button
                type="button"
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 group-hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 group-hover:shadow-blue-500/50 transition-all"
              >
                <span>Buka Dashboard Pengukuran Gardu</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Dashboard Realisasi LM (Perampalan dan Penebangan) */}
          <div
            onClick={() => onSelectView('row')}
            className="group relative bg-slate-800/80 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-emerald-500/80 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all pointer-events-none"></div>

            <div className="relative z-10 space-y-5">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-md">
                  <Trees className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/25">
                  MODUL 02
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                  Dashboard Realisasi LM (Perampalan & Penebangan)
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  Monitoring dan evaluasi komprehensif pekerjaan Right-of-Way (ROW) jaringan SUTM:
                  volume perampalan pohon (KMS), penebangan pohon bahaya (Batang), dan produktivitas tim.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Rekapitulasi Volume Perampalan (KMS) & Penebangan (Batang)</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Analisa Strategis, Evaluasi Hotspot & Rekomendasi Preventif</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Perbandingan Kinerja 7 ULP & Profil Radar Keseimbangan ROW</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Efisiensi Tim (Yantek, Pegawai, Volume Base, KHS)</span>
                </div>
              </div>

              {/* Live Metric Badges */}
              <div className="grid grid-cols-3 gap-2 pt-3">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold">Total Rampal</div>
                  <div className="text-sm sm:text-base font-black text-emerald-400 mt-0.5">
                    {rowLoading
                      ? '...'
                      : `${rowKmsTotal.toLocaleString('id-ID', { maximumFractionDigits: 0 })} KMS`}
                  </div>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold">Pohon Tebang</div>
                  <div className="text-sm sm:text-base font-black text-amber-400 mt-0.5">
                    {rowLoading ? '...' : `${rowBtgTotal.toLocaleString('id-ID')} btg`}
                  </div>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60 text-center">
                  <div className="text-[10px] text-slate-400 font-semibold">Log Kegiatan</div>
                  <div className="text-sm sm:text-base font-black text-white mt-0.5">
                    {rowLoading ? '...' : rowRecordCount.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-6 relative z-10">
              <button
                type="button"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 group-hover:shadow-emerald-500/50 transition-all"
              >
                <span>Buka Dashboard Realisasi LM (ROW)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            PT PLN (Persero) UP3 Bulukumba &bull; Sistem Monitoring Gardu & Right-of-Way (ROW)
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400 font-medium">Data Sumber Google Spreadsheet Resmi</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
