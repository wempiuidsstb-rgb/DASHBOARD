import React from 'react';
import { RowDashboardMetrics, RowFilterState } from '../types';
import { Scissors, TreePine, ClipboardList, MapPin, Users, CheckCircle2 } from 'lucide-react';

interface RowMetricCardsProps {
  metrics: RowDashboardMetrics;
  filters: RowFilterState;
  onFilterChange: (updater: (prev: RowFilterState) => RowFilterState) => void;
}

export const RowMetricCards: React.FC<RowMetricCardsProps> = ({
  metrics,
  filters,
  onFilterChange,
}) => {
  const topUlp = metrics.ulpStats[0];
  const topTim = metrics.timStats[0];
  const totalKms = metrics.totalRampalKms;

  const topUlpShare =
    totalKms > 0 && topUlp ? Math.round((topUlp.kms / totalKms) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Total Rampal (KMS) */}
      <div
        onClick={() =>
          onFilterChange((prev) => ({
            ...prev,
            activityType: prev.activityType === 'RAMPAL_ONLY' ? 'ALL' : 'RAMPAL_ONLY',
          }))
        }
        className={`bento-card cursor-pointer group select-none ${
          filters.activityType === 'RAMPAL_ONLY'
            ? 'ring-2 ring-slate-900 border-slate-900 bg-slate-100 shadow-sm'
            : 'hover:border-slate-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="stat-label text-slate-700 font-bold">Total Rampal</span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Scissors className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="stat-value text-slate-950 mt-2 font-black">
          {metrics.totalRampalKms.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          <span className="text-xs font-bold text-slate-600 ml-1">KMS</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 mt-3 rounded-full overflow-hidden">
          <div className="bg-slate-800 h-full w-full rounded-full"></div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
          <span>Rata-rata giat</span>
          <span className="font-bold text-slate-900">{metrics.avgRampalPerKegiatan} KMS</span>
        </div>
      </div>

      {/* 2. Total Tebang (Batang) */}
      <div
        onClick={() =>
          onFilterChange((prev) => ({
            ...prev,
            activityType: prev.activityType === 'TEBANG_ONLY' ? 'ALL' : 'TEBANG_ONLY',
          }))
        }
        className={`bento-card cursor-pointer group select-none ${
          filters.activityType === 'TEBANG_ONLY'
            ? 'ring-2 ring-amber-600 border-amber-600 bg-amber-50 shadow-sm'
            : 'hover:border-amber-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="stat-label text-slate-700">Pohon Ditebang</span>
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <TreePine className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="stat-value text-slate-950 mt-2">
          {metrics.totalTebangBtg.toLocaleString('id-ID')}
          <span className="text-xs font-bold text-slate-600 ml-1">btg</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 mt-3 rounded-full overflow-hidden">
          <div className="bg-amber-500 h-full w-full rounded-full"></div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
          <span>Rata-rata giat</span>
          <span className="font-bold text-slate-900">{metrics.avgTebangPerKegiatan} btg</span>
        </div>
      </div>

      {/* 3. Total Kegiatan ROW */}
      <div
        onClick={() => onFilterChange((prev) => ({ ...prev, activityType: 'ALL' }))}
        className={`bento-card cursor-pointer group select-none ${
          filters.activityType === 'ALL'
            ? 'ring-2 ring-slate-900 border-slate-900 shadow-sm'
            : 'hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="stat-label text-slate-700">Total Log ROW</span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <ClipboardList className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="stat-value text-slate-950 mt-2">{metrics.totalKegiatan.toLocaleString('id-ID')}</div>
        <div className="w-full bg-slate-200 h-1.5 mt-3 rounded-full overflow-hidden">
          <div className="bg-slate-900 h-full w-full rounded-full"></div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
          <span>Cakupan UP3</span>
          <span className="font-bold text-slate-900">7 Unit ULP</span>
        </div>
      </div>

      {/* 4. ULP Terdepan (KMS) */}
      <div
        onClick={() => {
          if (topUlp) {
            onFilterChange((prev) => ({
              ...prev,
              ulp: prev.ulp === topUlp.ulp ? 'ALL' : topUlp.ulp,
            }));
          }
        }}
        className="bento-card cursor-pointer group select-none hover:border-blue-300"
      >
        <div className="flex items-center justify-between">
          <span className="stat-label text-slate-700">ULP Teraktif</span>
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <MapPin className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="stat-value text-slate-950 mt-2 text-xl truncate">
          {topUlp ? topUlp.ulp.replace('ULP ', '') : '-'}
        </div>
        <div className="w-full bg-slate-200 h-1.5 mt-3 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full"
            style={{ width: `${Math.min(100, Math.max(10, topUlpShare))}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
          <span>Realisasi</span>
          <span className="font-bold text-slate-900">
            {topUlp ? `${topUlp.kms.toLocaleString()} KMS` : '0 KMS'}
          </span>
        </div>
      </div>

      {/* 5. Tim Pelaksana Utama */}
      <div
        onClick={() => {
          if (topTim) {
            onFilterChange((prev) => ({
              ...prev,
              tim: prev.tim === topTim.tim ? 'ALL' : topTim.tim,
            }));
          }
        }}
        className="bento-card cursor-pointer group select-none hover:border-indigo-300"
      >
        <div className="flex items-center justify-between">
          <span className="stat-label text-slate-700">Tim Dominan</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="stat-value text-slate-950 mt-2 text-xl truncate">
          {topTim ? topTim.tim : '-'}
        </div>
        <div className="w-full bg-slate-200 h-1.5 mt-3 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full"
            style={{ width: `${topTim ? topTim.percentage : 0}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
          <span>Kontribusi</span>
          <span className="font-bold text-slate-900">
            {topTim ? `${topTim.percentage}% (${topTim.count.toLocaleString()})` : '-'}
          </span>
        </div>
      </div>

      {/* 6. Rampal & Tebang Sekaligus */}
      <div
        onClick={() =>
          onFilterChange((prev) => ({
            ...prev,
            activityType: prev.activityType === 'BOTH' ? 'ALL' : 'BOTH',
          }))
        }
        className={`bento-card cursor-pointer group select-none ${
          filters.activityType === 'BOTH'
            ? 'ring-2 ring-purple-600 border-purple-600 bg-purple-50 shadow-sm'
            : 'hover:border-purple-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="stat-label text-slate-700">ROW Terpadu</span>
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="stat-value text-slate-950 mt-2 text-xl">
          {filters.activityType === 'BOTH' ? 'Aktif' : 'Keduanya'}
        </div>
        <div className="w-full bg-slate-200 h-1.5 mt-3 rounded-full overflow-hidden">
          <div className="bg-purple-600 h-full w-full rounded-full"></div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
          <span>Mode Filter</span>
          <span className="font-bold text-slate-900">Rampal + Tebang</span>
        </div>
      </div>
    </div>
  );
};
