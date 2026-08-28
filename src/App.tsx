import React, { useState, useEffect, useMemo } from 'react';
import { GarduRecord, FilterState, ActiveTab } from './types';
import { fetchGarduData, filterRecords, calculateMetrics, exportToCSV } from './data/garduService';
import { exportToPDF } from './utils/pdfExport';
import { Navbar } from './components/Navbar';
import { MetricCards } from './components/MetricCards';
import { FilterBar } from './components/FilterBar';
import { MapView } from './components/MapView';
import { AnalyticsView } from './components/AnalyticsView';
import { TableView } from './components/TableView';
import { PriorityView } from './components/PriorityView';
import { DetailModal } from './components/DetailModal';
import { Zap, AlertCircle, RefreshCw, ExternalLink, ShieldCheck, Database } from 'lucide-react';

const SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1yKABzadJ3umWnIG0d6vR8y4mZ3LopnU9GssvJf7_N18/edit?usp=sharing';

export default function App() {
  const [records, setRecords] = useState<GarduRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [selectedGardu, setSelectedGardu] = useState<GarduRecord | null>(null);
  const [highlightedGarduId, setHighlightedGarduId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    ulp: 'ALL',
    penyulang: 'ALL',
    status: 'ALL',
    kapasitas: 'ALL',
    onlyWithCoords: false,
    groundingAnomaly: false,
    highUnbalance: false,
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchGarduData();
      setRecords(data);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat dataset hasil pengukuran gardu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Unique dropdown options
  const ulpList = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.ulp) set.add(r.ulp);
    });
    return Array.from(set).sort();
  }, [records]);

  const penyulangList = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (filters.ulp !== 'ALL' && r.ulp !== filters.ulp) return;
      if (r.penyulang) set.add(r.penyulang);
    });
    return Array.from(set).sort();
  }, [records, filters.ulp]);

  const kapasitasList = useMemo(() => {
    const set = new Set<number>();
    records.forEach((r) => {
      const cap = Math.round(r.kapasitas);
      if (cap > 0) set.add(cap);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [records]);

  // Filtered records & Metrics
  const filteredRecords = useMemo(() => {
    return filterRecords(records, filters);
  }, [records, filters]);

  const metrics = useMemo(() => {
    return calculateMetrics(filteredRecords);
  }, [filteredRecords]);

  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  // Handlers
  const handleSelectGardu = (gardu: GarduRecord) => {
    setSelectedGardu(gardu);
  };

  const handleLocateOnMap = (gardu: GarduRecord) => {
    setHighlightedGarduId(gardu.id);
    setActiveTab('map');
  };

  const handleExport = () => {
    exportToCSV(filteredRecords, `pengukuran_gardu_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    setTimeout(() => {
      try {
        exportToPDF({
          records: filteredRecords,
          filters,
          metrics,
        });
      } catch (err) {
        console.error('Gagal mengekspor PDF:', err);
      } finally {
        setIsExportingPDF(false);
      }
    }, 60);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        onExport={handleExport}
        onExportPDF={handleExportPDF}
        onRefresh={loadData}
        isLoading={isLoading}
        isExportingPDF={isExportingPDF}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="bento-card p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <div className="text-base font-bold text-slate-900">Memuat Data Pengukuran Gardu...</div>
            <p className="text-xs text-slate-400">Sedang memproses 5.228 unit gardu dan koordinat GPS</p>
          </div>
        )}

        {/* Error Alert */}
        {error && !isLoading && (
          <div className="bento-card p-4 bg-red-50/80 border-red-200 text-red-800 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-xs"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* KPI Metric Cards */}
            <MetricCards
              metrics={metrics}
              filters={filters}
              onFilterChange={setFilters}
            />

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              ulpList={ulpList}
              penyulangList={penyulangList}
              kapasitasList={kapasitasList}
              filteredCount={filteredRecords.length}
              totalCount={records.length}
            />

            {/* Active Tab View */}
            <div className="transition-all duration-200">
              {activeTab === 'map' && (
                <MapView
                  records={filteredRecords}
                  onSelectGardu={handleSelectGardu}
                  selectedGarduId={highlightedGarduId}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView
                  records={filteredRecords}
                  onSelectGardu={handleSelectGardu}
                />
              )}

              {activeTab === 'table' && (
                <TableView
                  records={filteredRecords}
                  onSelectGardu={handleSelectGardu}
                  onLocateOnMap={handleLocateOnMap}
                  onExportPDF={handleExportPDF}
                  isExportingPDF={isExportingPDF}
                />
              )}

              {activeTab === 'priority' && (
                <PriorityView
                  records={filteredRecords}
                  onSelectGardu={handleSelectGardu}
                  onLocateOnMap={handleLocateOnMap}
                  onExportPDF={handleExportPDF}
                  isExportingPDF={isExportingPDF}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-[10px] shadow-xs">
              PLN
            </div>
            <span className="font-medium text-slate-700">
              <strong className="text-slate-900 font-bold">PLN UP3 Bulukumba</strong> &bull; Sistem Monitoring Hasil Pengukuran Gardu & Koordinat
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-blue-600 font-semibold transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <span>Sumber Data Google Spreadsheet (Sheet FORM)</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </footer>

      {/* Single Gardu Inspection Modal */}
      {selectedGardu && (
        <DetailModal
          gardu={selectedGardu}
          onClose={() => setSelectedGardu(null)}
          onLocateOnMap={handleLocateOnMap}
        />
      )}
    </div>
  );
}
