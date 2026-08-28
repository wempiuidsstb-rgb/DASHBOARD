import React, { useState } from 'react';
import { AppView } from '../types';
import {
  Home,
  Zap,
  Trees,
  RefreshCw,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface NavigationMenuProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  garduCount?: number;
  rowKmsTotal?: number;
  rowBtgTotal?: number;
  onRefreshAll?: () => void;
  isLoading?: boolean;
  dataSource?: 'live_google_sheets_csv' | 'local_cache';
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  currentView,
  onSelectView,
  garduCount = 5200,
  rowKmsTotal = 1624,
  rowBtgTotal = 1054,
  onRefreshAll,
  isLoading = false,
  dataSource = 'live_google_sheets_csv',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: AppView) => {
    onSelectView(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & UP3 Info */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNavClick('landing')}
              className="flex items-center space-x-2.5 focus:outline-none group text-left"
              title="Kembali ke Menu Utama"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 group-hover:bg-blue-500 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-600/30 transition-all">
                PLN
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-black text-white tracking-wide flex items-center gap-1.5">
                  <span>UP3 BULUKUMBA</span>
                  <span className="text-[10px] font-semibold text-blue-400 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800/50">
                    UID SULSELRABAR
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Portal Sistem Informasi Distribusi
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Switcher Tabs */}
          <div className="hidden md:flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner gap-1">
            {/* Tab 1: Menu Utama / Landing */}
            <button
              type="button"
              onClick={() => handleNavClick('landing')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentView === 'landing'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Home className={`w-4 h-4 ${currentView === 'landing' ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>Menu Utama</span>
            </button>

            <div className="w-px h-5 bg-slate-800 my-auto"></div>

            {/* Tab 2: Dashboard Pengukuran Gardu */}
            <button
              type="button"
              onClick={() => handleNavClick('gardu')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentView === 'gardu'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Zap className={`w-4 h-4 ${currentView === 'gardu' ? 'text-amber-300 fill-amber-300' : 'text-blue-400'}`} />
              <div className="text-left flex items-center gap-1.5">
                <span>Pengukuran Gardu</span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    currentView === 'gardu'
                      ? 'bg-blue-700/80 text-blue-100'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {garduCount.toLocaleString('id-ID')}
                </span>
              </div>
            </button>

            <div className="w-px h-5 bg-slate-800 my-auto"></div>

            {/* Tab 3: Dashboard Realisasi LM (ROW) */}
            <button
              type="button"
              onClick={() => handleNavClick('row')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                currentView === 'row'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trees className={`w-4 h-4 ${currentView === 'row' ? 'text-blue-400' : 'text-slate-400'}`} />
              <div className="text-left flex items-center gap-1.5">
                <span>Realisasi ROW (LM)</span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    currentView === 'row'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  {rowKmsTotal.toLocaleString('id-ID', { maximumFractionDigits: 0 })} KMS
                </span>
              </div>
            </button>
          </div>

          {/* Right Action & Status */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Live Sheets Status Pill */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                dataSource === 'live_google_sheets_csv'
                  ? 'bg-slate-800 text-slate-200 border-slate-700'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
              }`}
              title="Sinkronisasi Data Langsung dari Google Spreadsheet"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Google Sheets Live</span>
            </div>

            {/* Global Refresh Button */}
            {onRefreshAll && (
              <button
                type="button"
                onClick={onRefreshAll}
                disabled={isLoading}
                title="Muat Ulang Semua Data Sheet"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            )}
          </div>

          {/* Mobile Hamburger & Active Indicator */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Current View Indicator Pill on Mobile */}
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                currentView === 'landing'
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : currentView === 'gardu'
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500/40'
                  : 'bg-slate-800 text-white border-slate-700'
              }`}
            >
              {currentView === 'landing' && 'Menu Utama'}
              {currentView === 'gardu' && 'Gardu'}
              {currentView === 'row' && 'Realisasi ROW'}
            </span>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-5 space-y-2.5 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Pilih Modul Dashboard
          </div>

          {/* Option 1: Landing Page */}
          <button
            type="button"
            onClick={() => handleNavClick('landing')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all min-h-[48px] ${
              currentView === 'landing'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-blue-400">
                <Home className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm text-white font-bold">Halaman Utama (Landing)</div>
                <div className="text-[11px] text-slate-400">Pusat ringkasan & pemilihan modul</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Option 2: Pengukuran Gardu */}
          <button
            type="button"
            onClick={() => handleNavClick('gardu')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all min-h-[48px] ${
              currentView === 'gardu'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-300 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">Dashboard Pengukuran Gardu</div>
                <div className="text-[11px] text-slate-300">
                  Monitoring beban trafo ({garduCount.toLocaleString('id-ID')} unit) & GIS
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Option 3: Realisasi LM (ROW) */}
          <button
            type="button"
            onClick={() => handleNavClick('row')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all min-h-[48px] ${
              currentView === 'row'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center">
                <Trees className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">Dashboard Realisasi LM (ROW)</div>
                <div className="text-[11px] text-slate-300 font-medium">
                  Rampal {rowKmsTotal.toLocaleString('id-ID', { maximumFractionDigits: 0 })} KMS & {rowBtgTotal.toLocaleString('id-ID')} Batang
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Mobile Footer Sync Status & Refresh */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Google Sheets Live Sync</span>
            </div>
            {onRefreshAll && (
              <button
                type="button"
                onClick={onRefreshAll}
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
