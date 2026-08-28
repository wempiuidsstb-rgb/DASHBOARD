import React, { useState, useMemo } from 'react';
import { RowRecord, RowFilterState } from '../types';
import { filterRowRecords, calculateRowMetrics, exportRowToCSV } from '../data/rowService';
import { RowMetricCards } from './RowMetricCards';
import { RowCharts } from './RowCharts';
import { RowTable } from './RowTable';
import { RowStrategicAnalysis } from './RowStrategicAnalysis';
import {
  Search,
  RotateCcw,
  Download,
  RefreshCw,
  Trees,
  Filter,
  BarChart3,
  Table as TableIcon,
  Layers,
  Sparkles,
  Home,
  Zap,
  Calendar,
  Building2,
  Users,
  Lightbulb,
} from 'lucide-react';

interface RowDashboardViewProps {
  records: RowRecord[];
  isLoading: boolean;
  dataSource: 'live_google_sheets_csv' | 'local_cache';
  onRefresh: () => void;
  onNavigateHome?: () => void;
  onSwitchToGardu?: () => void;
}

const BULAN_OPTIONS = [
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

export const RowDashboardView: React.FC<RowDashboardViewProps> = ({
  records,
  isLoading,
  dataSource,
  onRefresh,
  onNavigateHome,
  onSwitchToGardu,
}) => {
  const [filters, setFilters] = useState<RowFilterState>({
    search: '',
    ulp: 'ALL',
    tim: 'ALL',
    bulan: 'ALL',
    activityType: 'ALL',
  });

  const [activeSubView, setActiveSubView] = useState<'all' | 'analysis' | 'charts' | 'table'>('all');

  // Extract unique ULP list from records
  const ulpList = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.ulpRaw) set.add(r.ulpRaw.trim().toUpperCase());
    });
    return Array.from(set).sort();
  }, [records]);

  // Extract unique Tim list from records
  const timList = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.tim) set.add(r.tim.trim());
    });
    return Array.from(set).sort();
  }, [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return filterRowRecords(records, filters);
  }, [records, filters]);

  // Calculate metrics based on filtered records
  const metrics = useMemo(() => {
    return calculateRowMetrics(filteredRecords);
  }, [filteredRecords]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      ulp: 'ALL',
      tim: 'ALL',
      bulan: 'ALL',
      activityType: 'ALL',
    });
  };

  const handleExportCSV = () => {
    exportRowToCSV(filteredRecords, `rekap_row_up3_${Date.now()}.csv`);
  };

  const isFilterActive =
    filters.search !== '' ||
    filters.ulp !== 'ALL' ||
    filters.tim !== 'ALL' ||
    filters.bulan !== 'ALL' ||
    filters.activityType !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bento-card bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white border-none p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Trees className="w-3.5 h-3.5" />
                REKAP UP3 &bull; Sheet REKAP UP3
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  dataSource === 'live_google_sheets_csv'
                    ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                    : 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {dataSource === 'live_google_sheets_csv' ? 'Google Sheets Live CSV' : 'Data Cadangan'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Dashboard Rekap Rampal & Tebang Pohon (ROW)
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl">
              Monitoring pelaksanaan pemeliharaan Right-of-Way (ROW) jaringan distribusi PLN UP3 Bulukumba:
              pemangkasan ranting pohon (KMS) dan penebangan pohon rawan tumbang (Batang).
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 transition-colors border border-white/15 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Sheet</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV ({filteredRecords.length.toLocaleString('id-ID')})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bento Controls */}
      <div className="bento-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Cari section, ULP, tanggal, atau tim..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Subview Toggle */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-full sm:w-auto justify-center sm:justify-start flex-wrap gap-1">
            <button
              onClick={() => setActiveSubView('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubView === 'all'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Ringkasan</span>
            </button>
            <button
              onClick={() => setActiveSubView('analysis')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubView === 'analysis'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Analisa Strategis</span>
            </button>
            <button
              onClick={() => setActiveSubView('charts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubView === 'charts'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Grafik Analitik</span>
            </button>
            <button
              onClick={() => setActiveSubView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubView === 'table'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabel Data</span>
            </button>
          </div>
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* ULP Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" /> Unit ULP
            </label>
            <select
              value={filters.ulp}
              onChange={(e) => setFilters((prev) => ({ ...prev, ulp: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua ULP ({ulpList.length})</option>
              {ulpList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Tim Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" /> Tim Pelaksana
            </label>
            <select
              value={filters.tim}
              onChange={(e) => setFilters((prev) => ({ ...prev, tim: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Tim ({timList.length})</option>
              {timList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Bulan Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Bulan Pelaksanaan
            </label>
            <select
              value={filters.bulan}
              onChange={(e) => setFilters((prev) => ({ ...prev, bulan: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Bulan</option>
              {BULAN_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" /> Jenis Kegiatan
            </label>
            <select
              value={filters.activityType}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, activityType: e.target.value as any }))
              }
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Semua (Rampal & Tebang)</option>
              <option value="RAMPAL_ONLY">Hanya Rampal (&gt;0 KMS)</option>
              <option value="TEBANG_ONLY">Hanya Tebang (&gt;0 Batang)</option>
              <option value="BOTH">Rampal + Tebang Sekaligus</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges and Reset */}
        {isFilterActive && (
          <div className="flex items-center justify-between pt-2 text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-medium">Filter Aktif:</span>
              {filters.search && (
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                  Cari: "{filters.search}"
                </span>
              )}
              {filters.ulp !== 'ALL' && (
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                  ULP: {filters.ulp}
                </span>
              )}
              {filters.tim !== 'ALL' && (
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                  Tim: {filters.tim}
                </span>
              )}
              {filters.bulan !== 'ALL' && (
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                  Bulan: {filters.bulan}
                </span>
              )}
              {filters.activityType !== 'ALL' && (
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                  Jenis: {filters.activityType}
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          </div>
        )}
      </div>

      {/* 6 Bento Metric Cards */}
      <RowMetricCards
        metrics={metrics}
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Analisa Strategis */}
      {(activeSubView === 'all' || activeSubView === 'analysis') && (
        <RowStrategicAnalysis
          metrics={metrics}
          records={filteredRecords}
          onSelectUlp={(ulp) => setFilters((prev) => ({ ...prev, ulp: ulp.replace('ULP ', '') }))}
          onSelectTim={(tim) => setFilters((prev) => ({ ...prev, tim }))}
        />
      )}

      {/* Analytics Visualizations */}
      {(activeSubView === 'all' || activeSubView === 'charts') && (
        <RowCharts
          metrics={metrics}
          onSelectUlp={(ulp) => setFilters((prev) => ({ ...prev, ulp: ulp.replace('ULP ', '') }))}
          onSelectTim={(tim) => setFilters((prev) => ({ ...prev, tim }))}
        />
      )}

      {/* Data Table */}
      {(activeSubView === 'all' || activeSubView === 'table') && (
        <RowTable
          records={filteredRecords}
          totalRecordsCount={records.length}
        />
      )}
    </div>
  );
};
