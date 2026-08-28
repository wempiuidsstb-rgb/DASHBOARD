import React, { useState, useMemo } from 'react';
import { GarduRecord } from '../types';
import { AlertOctagon, Zap, ShieldAlert, Wrench, MapPin, ExternalLink, Filter, ChevronRight, CheckCircle2, FileDown, Loader2 } from 'lucide-react';

interface PriorityViewProps {
  records: GarduRecord[];
  onSelectGardu: (gardu: GarduRecord) => void;
  onLocateOnMap: (gardu: GarduRecord) => void;
  onExportPDF?: () => void;
  isExportingPDF?: boolean;
}

export const PriorityView: React.FC<PriorityViewProps> = ({
  records,
  onSelectGardu,
  onLocateOnMap,
  onExportPDF,
  isExportingPDF = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<'overload' | 'unbalance' | 'grounding' | 'visual'>('overload');

  // 1. Critical Overload (> 100% or > 80%)
  const criticalOverload = useMemo(() => {
    return records
      .filter((r) => r.beban_pct >= 100)
      .sort((a, b) => b.beban_pct - a.beban_pct);
  }, [records]);

  // 2. Critical Unbalance (> 30%)
  const criticalUnbalance = useMemo(() => {
    return records
      .filter((r) => r.unbalance_pct >= 30)
      .sort((a, b) => b.unbalance_pct - a.unbalance_pct);
  }, [records]);

  // 3. Grounding Anomaly (> 5 Ohm)
  const criticalGrounding = useMemo(() => {
    return records
      .filter((r) => r.pembumian > 5)
      .sort((a, b) => b.pembumian - a.pembumian);
  }, [records]);

  // 4. Physical / Visual Issues (Karat, Bocor, Rembes, Arrester kurang)
  const criticalVisual = useMemo(() => {
    return records.filter((r) => {
      const minyak = (r.kebocoran_minyak || '').toUpperCase();
      const fisik = (r.kondisi_fisik || '').toUpperCase();
      const arrester = (r.arrester || '').toUpperCase();
      const fco = (r.fco || '').toUpperCase();
      return (
        minyak.includes('REMBES') ||
        minyak.includes('BOCOR') ||
        fisik.includes('KARAT') ||
        fisik.includes('PENYOK') ||
        arrester.includes('RUSAK') ||
        fco.includes('RUSAK')
      );
    });
  }, [records]);

  const activeList = useMemo(() => {
    switch (activeCategory) {
      case 'overload':
        return criticalOverload;
      case 'unbalance':
        return criticalUnbalance;
      case 'grounding':
        return criticalGrounding;
      case 'visual':
        return criticalVisual;
    }
  }, [activeCategory, criticalOverload, criticalUnbalance, criticalGrounding, criticalVisual]);

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs - Bento Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => setActiveCategory('overload')}
          className={`bento-card text-left cursor-pointer group select-none transition-all ${
            activeCategory === 'overload'
              ? 'ring-2 ring-red-500 border-red-500 bg-red-50/30 shadow-sm'
              : 'hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="stat-label text-red-600">Overload &gt; 100%</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertOctagon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="stat-value text-red-600 mt-2">{criticalOverload.length.toLocaleString()}</div>
          <div className="w-full bg-red-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full w-full rounded-full"></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Perlu Up-rating / Pecah Beban</p>
        </button>

        <button
          onClick={() => setActiveCategory('unbalance')}
          className={`bento-card text-left cursor-pointer group select-none transition-all ${
            activeCategory === 'unbalance'
              ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/30 shadow-sm'
              : 'hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="stat-label text-amber-600">Unbalance &gt; 30%</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="stat-value text-amber-600 mt-2">{criticalUnbalance.length.toLocaleString()}</div>
          <div className="w-full bg-amber-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full w-full rounded-full"></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Penyetimbangan Beban Fasa</p>
        </button>

        <button
          onClick={() => setActiveCategory('grounding')}
          className={`bento-card text-left cursor-pointer group select-none transition-all ${
            activeCategory === 'grounding'
              ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/30 shadow-sm'
              : 'hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="stat-label text-blue-600">Arde &gt; 5 &Omega;</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="stat-value text-blue-600 mt-2">{criticalGrounding.length.toLocaleString()}</div>
          <div className="w-full bg-blue-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-full rounded-full"></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Perbaikan Elektroda Pembumian</p>
        </button>

        <button
          onClick={() => setActiveCategory('visual')}
          className={`bento-card text-left cursor-pointer group select-none transition-all ${
            activeCategory === 'visual'
              ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-50/30 shadow-sm'
              : 'hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="stat-label text-purple-600">Anomali Fisik</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="stat-value text-purple-600 mt-2">{criticalVisual.length.toLocaleString()}</div>
          <div className="w-full bg-purple-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full w-full rounded-full"></div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Minyak, Arrester, FCO</p>
        </button>
      </div>

      {/* Priority List Card - Bento Container */}
      <div className="bento-card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daftar Tindakan Rekomendasi ({activeList.length.toLocaleString()} Gardu)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Diurutkan berdasarkan tingkat urgensi penanganan untuk keandalan penyaluran listrik
            </p>
          </div>

          {onExportPDF && (
            <button
              onClick={onExportPDF}
              disabled={isExportingPDF}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 self-end sm:self-center"
            >
              {isExportingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>Ekspor PDF Prioritas</span>
            </button>
          )}
        </div>

        {activeList.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
            <div className="text-base font-bold text-slate-700">Tidak ada gardu pada kategori ini</div>
            <div className="text-xs mt-1">Kondisi seluruh gardu berada dalam batas aman standar operasional.</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeList.slice(0, 50).map((gardu, index) => {
              // Recommended technical action
              let recommendation = '';
              let badgeColor = 'bg-red-50 text-red-700 border-red-200';

              if (activeCategory === 'overload') {
                const nextCap =
                  gardu.kapasitas <= 25
                    ? 50
                    : gardu.kapasitas <= 50
                    ? 100
                    : gardu.kapasitas <= 100
                    ? 160
                    : gardu.kapasitas <= 160
                    ? 200
                    : 250;
                recommendation = `Usulkan Uprating ke ${nextCap} kVA atau Pecah Beban Jurusan JTR`;
              } else if (activeCategory === 'unbalance') {
                recommendation = `Lakukan penyeimbangan fasa antar jurusan (Beban fasa R: ${gardu.ir}A, S: ${gardu.is}A, T: ${gardu.it}A)`;
                badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
              } else if (activeCategory === 'grounding') {
                recommendation = `Tahanan tanah ${gardu.pembumian} \u03A9 (Standar \u2264 5 \u03A9). Tambah elektroda pembumian paralel.`;
                badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
              } else {
                recommendation = `Periksa kebocoran minyak (${gardu.kebocoran_minyak || 'Normal'}) & fisik trafo (${gardu.kondisi_fisik || 'Normal'})`;
                badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
              }

              return (
                <div
                  key={gardu.id}
                  className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                      #{index + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900">{gardu.gardu}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                          {gardu.ulp}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          Penyulang: {gardu.penyulang || '-'}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                          {activeCategory === 'overload'
                            ? `Beban ${gardu.beban_pct}%`
                            : activeCategory === 'unbalance'
                            ? `Unbalance ${gardu.unbalance_pct}%`
                            : activeCategory === 'grounding'
                            ? `Arde ${gardu.pembumian} \u03A9`
                            : 'Anomali Fisik'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5">
                        <span>
                          Kapasitas: <strong className="text-slate-900 font-semibold">{gardu.kapasitas} kVA</strong> ({gardu.fasa} Ph)
                        </span>
                        <span>
                          Arus: <strong>R:{gardu.ir}A, S:{gardu.is}A, T:{gardu.it}A, N:{gardu.in}A</strong>
                        </span>
                        <span>
                          Tegangan: <strong>{gardu.vfn} V / {gardu.vff} V</strong>
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 flex items-center gap-2 mt-1">
                        <Wrench className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>
                          <strong>Rekomendasi:</strong> {recommendation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                    {gardu.lat && gardu.lng && (
                      <button
                        onClick={() => onLocateOnMap(gardu)}
                        title="Tampilkan di Peta"
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>Peta</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectGardu(gardu)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
                    >
                      <span>Rincian</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
