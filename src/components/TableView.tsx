import React, { useState, useMemo } from 'react';
import { GarduRecord } from '../types';
import { exportToCSV } from '../data/garduService';
import { Download, ArrowUpDown, ChevronLeft, ChevronRight, MapPin, ExternalLink, Eye, FileDown, Loader2 } from 'lucide-react';

interface TableViewProps {
  records: GarduRecord[];
  onSelectGardu: (gardu: GarduRecord) => void;
  onLocateOnMap: (gardu: GarduRecord) => void;
  onExportPDF?: () => void;
  isExportingPDF?: boolean;
}

type SortField = 'gardu' | 'ulp' | 'kapasitas' | 'beban_pct' | 'unbalance_pct' | 'pembumian' | 'date';

export const TableView: React.FC<TableViewProps> = ({
  records,
  onSelectGardu,
  onLocateOnMap,
  onExportPDF,
  isExportingPDF = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<SortField>('beban_pct');
  const [sortAsc, setSortAsc] = useState(false);

  // Sorting
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [records, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for numbers
    }
  };

  const handleExport = () => {
    exportToCSV(records, `pengukuran_gardu_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="bento-card p-0 overflow-hidden flex flex-col">
      {/* Top Header & Export */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Tabel Data Hasil Pengukuran Gardu ({records.length.toLocaleString()} Unit)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Klik baris gardu untuk membuka analisis lengkap, histori beban, dan foto evidence
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-end sm:self-center">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <span className="stat-label text-slate-500 font-normal">Tampilkan:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1.5 px-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 font-semibold text-xs focus:outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button
            onClick={handleExport}
            disabled={isExportingPDF}
            className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          {onExportPDF && (
            <button
              onClick={onExportPDF}
              disabled={isExportingPDF}
              className="px-3.5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
            >
              {isExportingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>Ekspor PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50/90 text-slate-500 font-bold border-b border-slate-200 select-none">
            <tr>
              <th className="py-3.5 px-3.5 w-12 text-center">No</th>
              <th
                onClick={() => handleSort('gardu')}
                className="py-3.5 px-3.5 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Nama Gardu</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('ulp')}
                className="py-3.5 px-3.5 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>ULP / Penyulang</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('kapasitas')}
                className="py-3.5 px-3.5 text-right cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Kapasitas</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('beban_pct')}
                className="py-3.5 px-3.5 text-right cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>% Beban</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('unbalance_pct')}
                className="py-3.5 px-3.5 text-right cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>% Unbalance</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-3.5 text-right">Arus R / S / T (A)</th>
              <th className="py-3.5 px-3.5 text-right">Arus N (A)</th>
              <th className="py-3.5 px-3.5 text-right">Tegangan</th>
              <th
                onClick={() => handleSort('pembumian')}
                className="py-3.5 px-3.5 text-right cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Grounding</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-3.5 text-center">Status</th>
              <th className="py-3.5 px-3.5 text-center">Koordinat</th>
              <th className="py-3.5 px-3.5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.map((r, idx) => {
              const rowNum = (currentPage - 1) * pageSize + idx + 1;
              const isOverload = r.status_beban === 'OVERLOAD';
              const isUnderload = r.status_beban === 'UNDERLOAD';

              return (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
                  onClick={() => onSelectGardu(r)}
                >
                  <td className="py-3.5 px-3.5 text-center text-slate-400 font-mono text-[11px]">{rowNum}</td>
                  <td className="py-3.5 px-3.5">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {r.gardu}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{r.date}</div>
                  </td>
                  <td className="py-3.5 px-3.5">
                    <div className="font-semibold text-slate-800">{r.ulp}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                      {r.penyulang || '-'}
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-medium text-slate-700">
                    <div className="font-semibold text-slate-800">{r.kapasitas} kVA</div>
                    <div className="text-[10px] text-slate-400">{r.fasa} Fasa</div>
                  </td>
                  <td className="py-3.5 px-3.5 text-right">
                    <span
                      className={`inline-block font-bold px-2.5 py-0.5 rounded-full text-xs ${
                        isOverload
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : isUnderload
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {r.beban_pct}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-right">
                    <span
                      className={`font-semibold ${
                        r.unbalance_pct > 30
                          ? 'text-red-600 font-bold'
                          : r.unbalance_pct > 20
                          ? 'text-amber-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {r.unbalance_pct}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-mono text-slate-600">
                    {r.ir} / {r.is} / {r.it}
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-mono text-slate-600">{r.in} A</td>
                  <td className="py-3.5 px-3.5 text-right font-mono text-slate-600">
                    {r.vfn} / {r.vff} V
                  </td>
                  <td className="py-3.5 px-3.5 text-right">
                    <span
                      className={`font-semibold ${
                        r.pembumian > 5
                          ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]'
                          : r.pembumian > 0
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {r.pembumian > 0 ? `${r.pembumian} \u03A9` : '-'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-center">
                    <span
                      className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isOverload
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : isUnderload
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {r.status_beban}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    {r.lat && r.lng ? (
                      <button
                        onClick={() => onLocateOnMap(r)}
                        title={`Lat: ${r.lat}, Lng: ${r.lng}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors border border-slate-200"
                      >
                        <MapPin className="w-3 h-3 text-blue-600" />
                        <span>GPS</span>
                      </button>
                    ) : (
                      <span className="text-slate-300 text-[10px]">No GPS</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectGardu(r)}
                      title="Lihat Detail Gardu"
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Halaman <strong className="text-slate-900 font-bold">{currentPage}</strong> dari{' '}
          <strong className="text-slate-900 font-bold">{totalPages}</strong> (Total {sortedRecords.length.toLocaleString()}{' '}
          gardu)
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 transition-colors"
          >
            Pertama
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3.5 py-1.5 font-bold text-slate-900 bg-slate-50 rounded-xl border border-slate-200">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 transition-colors"
          >
            Terakhir
          </button>
        </div>
      </div>
    </div>
  );
};
