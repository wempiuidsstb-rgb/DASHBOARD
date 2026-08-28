import React from 'react';
import { FilterState } from '../types';
import { Search, RotateCcw, SlidersHorizontal, MapPin, AlertCircle, ZapOff } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
  ulpList: string[];
  penyulangList: string[];
  kapasitasList: number[];
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  ulpList,
  penyulangList,
  kapasitasList,
  filteredCount,
  totalCount,
}) => {
  const isFiltered =
    filters.search !== '' ||
    filters.ulp !== 'ALL' ||
    filters.penyulang !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.kapasitas !== 'ALL' ||
    filters.onlyWithCoords ||
    filters.groundingAnomaly ||
    filters.highUnbalance;

  const handleReset = () => {
    onFilterChange(() => ({
      search: '',
      ulp: 'ALL',
      penyulang: 'ALL',
      status: 'ALL',
      kapasitas: 'ALL',
      onlyWithCoords: false,
      groundingAnomaly: false,
      highUnbalance: false,
    }));
  };

  return (
    <div className="bento-card p-4 sm:p-5 space-y-3.5">
      {/* Top row: Search & Core dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search input */}
        <div className="relative lg:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Cari gardu (BL03049), penyulang, petugas..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 placeholder-slate-400 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange((prev) => ({ ...prev, search: '' }))}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Hapus
            </button>
          )}
        </div>

        {/* ULP dropdown */}
        <div>
          <select
            value={filters.ulp}
            onChange={(e) => onFilterChange((prev) => ({ ...prev, ulp: e.target.value, penyulang: 'ALL' }))}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 cursor-pointer font-medium"
          >
            <option value="ALL">Semua ULP (7 Unit)</option>
            {ulpList.map((ulp) => (
              <option key={ulp} value={ulp}>
                {ulp}
              </option>
            ))}
          </select>
        </div>

        {/* Status Beban */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange((prev) => ({ ...prev, status: e.target.value }))}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 cursor-pointer font-medium"
          >
            <option value="ALL">Semua Status Beban</option>
            <option value="OVERLOAD">🔴 Overload (&gt;80%)</option>
            <option value="NORMAL">🟢 Normal (40-80%)</option>
            <option value="UNDERLOAD">🔵 Underload (&lt;40%)</option>
          </select>
        </div>

        {/* Kapasitas Trafo */}
        <div>
          <select
            value={filters.kapasitas}
            onChange={(e) => onFilterChange((prev) => ({ ...prev, kapasitas: e.target.value }))}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 cursor-pointer font-medium"
          >
            <option value="ALL">Semua Kapasitas (kVA)</option>
            {kapasitasList.map((cap) => (
              <option key={cap} value={cap.toString()}>
                {cap} kVA
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Second row: Penyulang dropdown & Quick toggle badges */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Optional Penyulang select */}
          <div className="w-52">
            <select
              value={filters.penyulang}
              onChange={(e) => onFilterChange((prev) => ({ ...prev, penyulang: e.target.value }))}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 font-medium"
            >
              <option value="ALL">Semua Penyulang ({penyulangList.length})</option>
              {penyulangList.map((penyulang) => (
                <option key={penyulang} value={penyulang}>
                  {penyulang}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle: Only with GPS coords */}
          <button
            type="button"
            onClick={() => onFilterChange((prev) => ({ ...prev, onlyWithCoords: !prev.onlyWithCoords }))}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filters.onlyWithCoords
                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Ada GPS</span>
          </button>

          {/* Toggle: Grounding > 5 Ohm */}
          <button
            type="button"
            onClick={() => onFilterChange((prev) => ({ ...prev, groundingAnomaly: !prev.groundingAnomaly }))}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filters.groundingAnomaly
                ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Grounding &gt; 5 &Omega;</span>
          </button>

          {/* Toggle: High Unbalance > 25% */}
          <button
            type="button"
            onClick={() => onFilterChange((prev) => ({ ...prev, highUnbalance: !prev.highUnbalance }))}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filters.highUnbalance
                ? 'bg-purple-600 border-purple-600 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ZapOff className="w-3.5 h-3.5" />
            <span>Unbalance &gt; 25%</span>
          </button>
        </div>

        {/* Counter and Reset button */}
        <div className="flex items-center space-x-3 text-xs text-slate-500 ml-auto">
          <span>
            Menampilkan <strong className="text-slate-900 font-bold">{filteredCount.toLocaleString()}</strong> dari{' '}
            {totalCount.toLocaleString()} gardu
          </span>
          {isFiltered && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
