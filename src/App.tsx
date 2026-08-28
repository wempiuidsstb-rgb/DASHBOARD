import React, { useState, useEffect, useMemo } from 'react';
import { GarduRecord, FilterState, ActiveTab, RowRecord, AppView } from './types';
import { fetchGarduData, filterRecords, calculateMetrics, exportToCSV, getLastDataSource } from './data/garduService';
import { fetchRowData, getLastRowDataSource, calculateRowMetrics, exportRowToCSV } from './data/rowService';
import { exportToPDF } from './utils/pdfExport';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { MetricCards } from './components/MetricCards';
import { FilterBar } from './components/FilterBar';
import { MapView } from './components/MapView';
import { AnalyticsView } from './components/AnalyticsView';
import { TableView } from './components/TableView';
import { PriorityView } from './components/PriorityView';
import { RowDashboardView } from './components/RowDashboardView';
import { DetailModal } from './components/DetailModal';
import { AlertCircle, RefreshCw, Database, Trees, ExternalLink, ArrowLeft } from 'lucide-react';

const SPREADSHEET_GARDU_URL =
  'https://docs.google.com/spreadsheets/d/1yKABzadJ3umWnIG0d6vR8y4mZ3LopnU9GssvJf7_N18/edit?gid=1506456079#gid=1506456079';
const SPREADSHEET_ROW_URL =
  'https://docs.google.com/spreadsheets/d/1YIGLc3v75FXULTpIElPoTkisL1Lef_rXvxUp_nV2YQA/edit?gid=1881629360#gid=1881629360';

export default function App() {
  // Navigation View State: 'landing' (default) | 'gardu' | 'row'
  const [currentView, setCurrentView] = useState<AppView>('landing');

  // Pengukuran Gardu Data State
  const [records, setRecords] = useState<GarduRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'live_google_sheets_csv' | 'local_cache'>('live_google_sheets_csv');

  // Rekap ROW UP3 Data State
  const [rowRecords, setRowRecords] = useState<RowRecord[]>([]);
  const [isLoadingRow, setIsLoadingRow] = useState<boolean>(false);
  const [rowDataSource, setRowDataSource] = useState<'live_google_sheets_csv' | 'local_cache'>('live_google_sheets_csv');

  // Gardu Sub-Tabs
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
    loadData(false);
    loadRowData(false);
  }, []);

  const loadData = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchGarduData(forceRefresh);
      setRecords(data);
      setDataSource(getLastDataSource());
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat dataset hasil pengukuran gardu.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRowData = async (forceRefresh = false) => {
    setIsLoadingRow(true);
    try {
      const data = await fetchRowData(forceRefresh);
      setRowRecords(data);
      setRowDataSource(getLastRowDataSource());
    } catch (err: any) {
      console.error('Gagal memuat dataset ROW:', err);
    } finally {
      setIsLoadingRow(false);
    }
  };

  // Gardu Unique dropdown options
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

  // Global ROW Metrics for Landing Page
  const globalRowMetrics = useMemo(() => {
    return calculateRowMetrics(rowRecords);
  }, [rowRecords]);

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

  // If in Landing Page view
  if (currentView === 'landing') {
    return (
      <LandingPage
        onSelectView={(view) => setCurrentView(view)}
        garduMetrics={metrics}
        garduLoading={isLoading}
        rowRecordCount={rowRecords.length}
        rowKmsTotal={globalRowMetrics.totalRampalKms}
        rowBtgTotal={globalRowMetrics.totalTebangBtg}
        rowLoading={isLoadingRow}
        onRefreshAll={() => {
          loadData(true);
          loadRowData(true);
        }}
      />
    );
  }

  // If in ROW (Realisasi LM / Rampal & Tebang) view
  if (currentView === 'row') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <RowDashboardView
            records={rowRecords}
            isLoading={isLoadingRow}
            dataSource={rowDataSource}
            onRefresh={() => loadRowData(true)}
            onNavigateHome={() => setCurrentView('landing')}
            onSwitchToGardu={() => setCurrentView('gardu')}
          />
        </main>

        <footer className="bg-white border-t border-slate-200/80 py-5 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={() => setCurrentView('landing')}
                className="font-bold text-slate-800 hover:text-emerald-600 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Menu Utama</span>
              </button>
              <span className="text-slate-300">|</span>
              <span className="font-medium text-slate-700">
                PT PLN (Persero) UP3 Bulukumba &bull; Dashboard Realisasi LM
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <a
                href={SPREADSHEET_ROW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 font-semibold transition-colors"
              >
                <Trees className="w-3.5 h-3.5 text-emerald-500" />
                <span>Spreadsheet REKAP UP3 (ROW)</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Otherwise: Dashboard Pengukuran Gardu view
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        dataSource={dataSource}
        onExport={handleExport}
        onExportPDF={handleExportPDF}
        onRefresh={() => loadData(true)}
        isLoading={isLoading}
        isExportingPDF={isExportingPDF}
        onNavigateHome={() => setCurrentView('landing')}
        onSwitchToRow={() => setCurrentView('row')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="bento-card p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <div className="text-base font-bold text-slate-900">Memuat Data Pengukuran Gardu...</div>
            <p className="text-xs text-slate-400">
              Mengunduh & memproses 5.200+ unit gardu via Google Sheets CSV stream
            </p>
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
              onClick={() => loadData(true)}
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
            <button
              type="button"
              onClick={() => setCurrentView('landing')}
              className="font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Menu Utama</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="font-medium text-slate-700">
              <strong className="text-slate-900 font-bold">PLN UP3 Bulukumba</strong> &bull; Dashboard Pengukuran Gardu
            </span>
          </div>

          <div className="flex items-center space-x-4 flex-wrap">
            <a
              href={SPREADSHEET_GARDU_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-blue-600 font-semibold transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-blue-500" />
              <span>Spreadsheet FORM (Gardu)</span>
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
