import React, { useEffect, useState } from 'react';
import { GarduRecord } from '../types';
import { exportSingleGarduPDF } from '../utils/pdfExport';
import {
  X,
  MapPin,
  ExternalLink,
  Zap,
  Gauge,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  User,
  Wrench,
  AlertTriangle,
  FileText,
  Layers,
  FileDown,
  Loader2,
} from 'lucide-react';

interface DetailModalProps {
  gardu: GarduRecord | null;
  onClose: () => void;
  onLocateOnMap: (gardu: GarduRecord) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  gardu,
  onClose,
  onLocateOnMap,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!gardu) return null;

  const handlePrintPDF = () => {
    setIsExporting(true);
    try {
      exportSingleGarduPDF(gardu);
    } finally {
      setIsExporting(false);
    }
  };

  const isOverload = gardu.status_beban === 'OVERLOAD';
  const isUnderload = gardu.status_beban === 'UNDERLOAD';
  const maxCurrent = Math.max(gardu.ir, gardu.is, gardu.it, 1);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight">{gardu.gardu}</span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isOverload
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                    : isUnderload
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {gardu.status_beban}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                {gardu.tipe || 'UMUM'}
              </span>
            </div>
            <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 font-medium">
              <span className="font-bold text-blue-400">{gardu.ulp}</span>
              <span>&bull;</span>
              <span>Penyulang: <strong className="text-white">{gardu.penyulang || '-'}</strong></span>
              {gardu.section && (
                <>
                  <span>&bull;</span>
                  <span>Section: <strong className="text-white">{gardu.section}</strong></span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          {/* Section 1: Parameter Kelistrikan & Beban */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Pengukuran Beban & Kelistrikan</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bento-card p-3.5">
                <span className="stat-label text-slate-500 block">Kapasitas Trafo</span>
                <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{gardu.kapasitas} kVA</span>
                <span className="text-[11px] text-slate-400 font-medium">{gardu.fasa} Fasa</span>
              </div>

              <div className="bento-card p-3.5">
                <span className="stat-label text-slate-500 block">Daya Terpakai</span>
                <span className="text-lg font-extrabold text-slate-900 mt-0.5 block">{gardu.beban_kva} kVA</span>
                <span className="text-[11px] text-slate-400 font-medium">Rata-rata: {gardu.avg_i} A</span>
              </div>

              <div
                className={`bento-card p-3.5 ${
                  isOverload
                    ? 'bg-red-50/70 border-red-200 text-red-900'
                    : isUnderload
                    ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}
              >
                <span className="stat-label block opacity-80">% Pembebanan</span>
                <span className="text-lg font-black mt-0.5 block">{gardu.beban_pct}%</span>
                <span className="text-[11px] block opacity-80 font-medium">
                  {isOverload ? 'Melebihi Kapasitas' : isUnderload ? 'Di Bawah 40%' : 'Beban Normal'}
                </span>
              </div>

              <div className="bento-card p-3.5">
                <span className="stat-label text-slate-500 block">% Unbalance</span>
                <span
                  className={`text-lg font-black mt-0.5 block ${
                    gardu.unbalance_pct > 30
                      ? 'text-red-600'
                      : gardu.unbalance_pct > 20
                      ? 'text-amber-600'
                      : 'text-slate-900'
                  }`}
                >
                  {gardu.unbalance_pct}%
                </span>
                <span className="text-[11px] text-slate-400 font-medium block">SPLN &le; 20%</span>
              </div>
            </div>

            {/* Current Phase Breakdown visualizer */}
            <div className="bento-card p-4 space-y-3">
              <span className="stat-label text-slate-800 block">
                Arus Fasa Trafo (Ampere)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Phase R */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-red-600 font-bold">Fasa R</span>
                    <span className="text-slate-900 font-mono font-bold">{gardu.ir} A</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (gardu.ir / maxCurrent) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Phase S */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-amber-600 font-bold">Fasa S</span>
                    <span className="text-slate-900 font-mono font-bold">{gardu.is} A</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (gardu.is / maxCurrent) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Phase T */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-blue-600 font-bold">Fasa T</span>
                    <span className="text-slate-900 font-mono font-bold">{gardu.it} A</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (gardu.it / maxCurrent) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Neutral N */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600 font-bold">Netral (N)</span>
                    <span className="text-slate-900 font-mono font-bold">{gardu.in} A</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-slate-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (gardu.in / maxCurrent) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Voltages & Grounding */}
              <div className="grid grid-cols-3 gap-3 pt-2.5 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 block stat-label">Tegangan Fasa-Netral:</span>
                  <strong className="text-slate-900 font-mono text-sm font-bold">{gardu.vfn} Volt</strong>
                </div>
                <div>
                  <span className="text-slate-500 block stat-label">Tegangan Fasa-Fasa:</span>
                  <strong className="text-slate-900 font-mono text-sm font-bold">{gardu.vff} Volt</strong>
                </div>
                <div>
                  <span className="text-slate-500 block stat-label">Tahanan Pembumian:</span>
                  <strong
                    className={`font-mono text-sm font-bold ${
                      gardu.pembumian > 5 ? 'text-amber-600' : 'text-emerald-700'
                    }`}
                  >
                    {gardu.pembumian} &Omega;{' '}
                    {gardu.pembumian > 5 ? '(> 5 \u03A9 Kritis)' : '(\u2264 5 \u03A9 Normal)'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Kondisi Visual & Fisik */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Pemeriksaan Visual & Fisik Peralatan</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 stat-label">Kebocoran Minyak:</span>
                <span className="font-semibold text-slate-900">{gardu.kebocoran_minyak || 'Normal / Bersih'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 stat-label">Kondisi Fisik Trafo:</span>
                <span className="font-semibold text-slate-900">{gardu.kondisi_fisik || 'Mulus'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 stat-label">Kesesuaian Ampere:</span>
                <span className="font-semibold text-slate-900">{gardu.kesesuaian_ampere || 'Sesuai Standar'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 stat-label">Kondisi LVSB/PHBTR:</span>
                <span className="font-semibold text-slate-900">{gardu.kondisi_lvsb || 'Boks Bersih, Rapi'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 stat-label">Lightning Arrester:</span>
                <span className="font-semibold text-slate-900">{gardu.arrester || 'Baik & Lengkap'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 block mb-0.5 stat-label">Fuse Cut Out (FCO):</span>
                <span className="font-semibold text-slate-900">{gardu.fco || 'Baik & Lengkap'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Catatan Pengukuran Jurusan */}
          {gardu.keterangan && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Pengukuran Arus per Jurusan (JTR)</span>
              </div>
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner">
                {gardu.keterangan}
              </div>
            </div>
          )}

          {/* Section 4: Koordinat & Navigasi */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Lokasi & Koordinat Gardu</span>
            </div>

            <div className="bento-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="stat-label text-slate-500">Koordinat Geografis:</div>
                <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                  {gardu.lat !== null && gardu.lng !== null
                    ? `${gardu.lat}, ${gardu.lng}`
                    : 'Koordinat belum terdata di lembar form'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                  Zona Proteksi: {gardu.zona || '-'}
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                {gardu.lat !== null && gardu.lng !== null && (
                  <>
                    <button
                      onClick={() => {
                        onClose();
                        onLocateOnMap(gardu);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      <span>Lihat di Peta</span>
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${gardu.lat},${gardu.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Google Maps</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Metadata Survei */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Petugas: <strong className="text-slate-700 font-semibold">{gardu.petugas || '-'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Waktu Ukur: <strong className="text-slate-700 font-semibold">{gardu.timestamp || gardu.date}</strong></span>
            </div>
            {gardu.progress && (
              <div className="w-full text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-1 font-medium">
                <strong>Progress / Status Tindak Lanjut:</strong> {gardu.progress}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={handlePrintPDF}
            disabled={isExporting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>Cetak Dokumen PDF</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
