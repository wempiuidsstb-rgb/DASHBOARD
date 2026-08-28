import React from 'react';
import { DashboardMetrics, FilterState } from '../types';
import { Activity, AlertOctagon, CheckCircle2, BatteryCharging, MapPin, Gauge } from 'lucide-react';

interface MetricCardsProps {
  metrics: DashboardMetrics;
  filters: FilterState;
  onFilterChange: (updater: (prev: FilterState) => FilterState) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
  filters,
  onFilterChange,
}) => {
  const overloadPct = metrics.total > 0 ? Math.round((metrics.overload / metrics.total) * 100) : 0;
  const normalPct = metrics.total > 0 ? Math.round((metrics.normal / metrics.total) * 100) : 0;
  const underloadPct = metrics.total > 0 ? Math.round((metrics.underload / metrics.total) * 100) : 0;
  const coordsPct = metrics.total > 0 ? Math.round((metrics.withCoords / metrics.total) * 100) : 0;
  const groundingPct =
    metrics.total > 0 ? Math.round((metrics.groundingNonCompliant / metrics.total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Total Gardu Bento Card */}
      <div
        onClick={() => onFilterChange((prev) => ({ ...prev, status: 'ALL' }))}
        className={`bento-card cursor-pointer group select-none ${
          filters.status === 'ALL'
            ? 'ring-2 ring-slate-900 border-slate-900 shadow-sm'
            : 'hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="stat-label">Total Gardu</span>
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="stat-value mt-2">{metrics.total.toLocaleString()}</div>
        <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
          <div className="bg-slate-900 h-full w-full rounded-full"></div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
          <span>Wilayah UP3</span>
          <span className="font-semibold text-slate-700">100% Terdata</span>
        </div>
      </div>

      {/* 2. Overload Bento Card */}
      <div
        onClick={() => onFilterChange((prev) => ({ ...prev, status: prev.status === 'OVERLOAD' ? 'ALL' : 'OVERLOAD' }))}
        className={`bento-card cursor-pointer group select-none ${
          filters.status === 'OVERLOAD'
            ? 'ring-2 ring-red-500 border-red-500 bg-red-50/20 shadow-sm'
            : 'hover:border-red-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="stat-label text-red-600">Overload &gt;80%</span>
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <AlertOctagon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="stat-value text-red-600 mt-2">{metrics.overload.toLocaleString()}</div>
        <div className="w-full bg-red-100 h-1.5 mt-3 rounded-full overflow-hidden">
          <div
            className="bg-red-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, overloadPct)}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-red-500 font-medium">Perlu Up-rating</span>
          <span className="font-bold text-red-600">{overloadPct}%</span>
        </div>
      </div>

      {/* 3. Normal Bento Card */}
      <div
        onClick={() => onFilterChange((prev) => ({ ...prev, status: prev.status === 'NORMAL' ? 'ALL' : 'NORMAL' }))}
        className={`bento-card cursor-pointer group select-none ${
          filters.status === 'NORMAL'
            ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20 shadow-sm'
            : 'hover:border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="stat-label text-emerald-600">Normal 40-80%</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="stat-value text-emerald-600 mt-2">{metrics.normal.toLocaleString()}</div>
        <div className="w-full bg-emerald-100 h-1.5 mt-3 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, normalPct)}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-emerald-600 font-medium">Beban Ideal</span>
          <span className="font-bold text-emerald-600">{normalPct}%</span>
        </div>
      </div>

      {/* 4. Underload Bento Card */}
      <div
        onClick={() => onFilterChange((prev) => ({ ...prev, status: prev.status === 'UNDERLOAD' ? 'ALL' : 'UNDERLOAD' }))}
        className={`bento-card cursor-pointer group select-none ${
          filters.status === 'UNDERLOAD'
            ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20 shadow-sm'
            : 'hover:border-blue-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="stat-label text-blue-600">Underload &lt;40%</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <BatteryCharging className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="stat-value text-blue-600 mt-2">{metrics.underload.toLocaleString()}</div>
        <div className="w-full bg-blue-100 h-1.5 mt-3 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, underloadPct)}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-blue-500 font-medium">Beban Rendah</span>
          <span className="font-bold text-blue-600">{underloadPct}%</span>
        </div>
      </div>

      {/* 5. GPS Terpetakan Bento Card */}
      <div
        onClick={() => onFilterChange((prev) => ({ ...prev, onlyWithCoords: !prev.onlyWithCoords }))}
        className={`bento-card cursor-pointer group select-none ${
          filters.onlyWithCoords
            ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/20 shadow-sm'
            : 'hover:border-indigo-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="stat-label text-indigo-600">GPS Terpetakan</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <MapPin className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="stat-value text-indigo-600 mt-2">{metrics.withCoords.toLocaleString()}</div>
        <div className="w-full bg-indigo-100 h-1.5 mt-3 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, coordsPct)}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-indigo-500 font-medium">Lat/Lng Valid</span>
          <span className="font-bold text-indigo-600">{coordsPct}%</span>
        </div>
      </div>

      {/* 6. Grounding Anomaly Bento Card */}
      <div
        onClick={() => onFilterChange((prev) => ({ ...prev, groundingAnomaly: !prev.groundingAnomaly }))}
        className={`bento-card cursor-pointer group select-none ${
          filters.groundingAnomaly
            ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/20 shadow-sm'
            : 'hover:border-amber-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="stat-label text-amber-600">Arde &gt; 5 &Omega;</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Gauge className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="stat-value text-amber-600 mt-2">
          {metrics.groundingNonCompliant.toLocaleString()}
        </div>
        <div className="w-full bg-amber-100 h-1.5 mt-3 rounded-full overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, groundingPct)}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs mt-2">
          <span className="text-amber-600 font-medium">Perlu Cek Elektroda</span>
          <span className="font-bold text-amber-600">{groundingPct}%</span>
        </div>
      </div>
    </div>
  );
};
