import React, { useState, useEffect } from 'react';
import { ActiveTab, DashboardMetrics } from '../types';
import { MapPin, BarChart3, Table as TableIcon, AlertTriangle, Download, RefreshCw, Zap, ShieldCheck, FileDown, Loader2 } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  metrics: DashboardMetrics;
  dataSource?: 'live_google_sheets_csv' | 'local_cache';
  onExport: () => void;
  onExportPDF: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  isExportingPDF?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  dataSource = 'live_google_sheets_csv',
  onExport,
  onExportPDF,
  onRefresh,
  isLoading,
  isExportingPDF = false,
}) => {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setCurrentDate(`${dateStr}, ${timeStr} WITA`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-200 shrink-0">
              <Zap className="w-6 h-6 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  PLN UP3 Bulukumba
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Sistem Distribusi Tenaga Listrik
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Dashboard Pengukuran Gardu
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Monitoring Real-time (Google Sheets Live CSV) &bull; UP3 Bulukumba
              </p>
            </div>
          </div>

          {/* Right Bento Status and Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
            {/* Live System Status Pill */}
            <div
              title={
                dataSource === 'live_google_sheets_csv'
                  ? 'Terhubung langsung ke Google Sheets Form (Streaming CSV)'
                  : 'Menggunakan dataset cadangan'
              }
              className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-xs"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>
                {dataSource === 'live_google_sheets_csv' ? 'Google Sheets Live' : 'Data Cadangan'}
              </span>
            </div>

            {/* Live Timestamp */}
            {currentDate && (
              <div className="text-xs font-medium text-slate-400 hidden lg:block font-mono">
                {currentDate}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onRefresh}
                disabled={isLoading || isExportingPDF}
                title="Muat Ulang Data"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition-colors disabled:opacity-50 text-xs flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={onExport}
                disabled={isExportingPDF}
                title="Ekspor Data ke CSV"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center space-x-1.5 transition-colors border border-slate-200"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
                onClick={onExportPDF}
                disabled={isExportingPDF || isLoading}
                title="Ekspor Laporan Resmi dalam Format PDF"
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-xs disabled:opacity-50"
              >
                {isExportingPDF ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5" />
                )}
                <span>Ekspor PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Bento Pill Segment */}
        <div className="py-2.5 border-t border-slate-100 flex items-center justify-between overflow-x-auto scrollbar-none gap-2">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'map'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Peta GIS & Koordinat ({metrics.withCoords.toLocaleString()})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analitik & Grafik Beban</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'table'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              <span>Tabel Pengukuran ({metrics.total.toLocaleString()})</span>
            </button>

            <button
              onClick={() => setActiveTab('priority')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'priority'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Prioritas Trafo ({metrics.overload.toLocaleString()})</span>
            </button>
          </div>

          {/* Mini info badge */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Total <strong>{metrics.total.toLocaleString()}</strong> Gardu Distribusi</span>
          </div>
        </div>
      </div>
    </header>
  );
};
