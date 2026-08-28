import React, { useState, useMemo } from 'react';
import { RowRecord } from '../types';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Scissors,
  TreePine,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from 'lucide-react';

interface RowTableProps {
  records: RowRecord[];
  totalRecordsCount: number;
}

type SortField = 'tanggal' | 'ulp' | 'section' | 'rampalKms' | 'tebangBtg' | 'tim';
type SortDirection = 'asc' | 'desc';

export const RowTable: React.FC<RowTableProps> = ({ records, totalRecordsCount }) => {
  const [sortField, setSortField] = useState<SortField>('tanggal');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Sorting
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [records, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, validCurrentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-600 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600 ml-1 inline" />
    );
  };

  const getTimBadge = (tim: string) => {
    const t = tim.toUpperCase();
    if (t.includes('YANTEK')) {
      return 'bg-blue-100 text-blue-950 border-blue-300 font-bold';
    }
    if (t.includes('PEGAWAI')) {
      return 'bg-indigo-100 text-indigo-950 border-indigo-300 font-bold';
    }
    if (t.includes('VOLUME BASE')) {
      return 'bg-amber-100 text-amber-950 border-amber-300 font-bold';
    }
    if (t.includes('KHS')) {
      return 'bg-slate-100 text-slate-900 border-slate-300 font-bold';
    }
    return 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
  };

  return (
    <div className="bento-card p-0 overflow-hidden">
      {/* Table Header & Pagination Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Daftar Log Realisasi Rampal & Tebang Pohon
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Menampilkan {sortedRecords.length.toLocaleString('id-ID')} dari total {totalRecordsCount.toLocaleString('id-ID')} log aktivitas
          </p>
        </div>

        {/* Page size & jump */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold select-none">
              <th className="py-3 px-4 w-12 text-center text-slate-400">#</th>
              <th
                onClick={() => handleSort('tanggal')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                Tanggal {renderSortIcon('tanggal')}
              </th>
              <th
                onClick={() => handleSort('ulp')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                Unit ULP {renderSortIcon('ulp')}
              </th>
              <th
                onClick={() => handleSort('section')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                Section / Penyulang {renderSortIcon('section')}
              </th>
              <th
                onClick={() => handleSort('rampalKms')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right whitespace-nowrap"
              >
                Rampal (KMS) {renderSortIcon('rampalKms')}
              </th>
              <th
                onClick={() => handleSort('tebangBtg')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-right whitespace-nowrap"
              >
                Tebang (Batang) {renderSortIcon('tebangBtg')}
              </th>
              <th
                onClick={() => handleSort('tim')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-center whitespace-nowrap"
              >
                Tim Pelaksana {renderSortIcon('tim')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((row, idx) => {
                const globalIndex = (validCurrentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="py-2.5 px-4 text-center text-slate-500 font-mono text-[11px] font-bold">
                      {globalIndex}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {row.tanggal || '-'}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-900 text-[11px] font-bold border border-slate-200">
                        {row.ulp.replace('ULP ', '')}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-950 font-bold max-w-[260px] truncate">
                      {row.section}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      {row.rampalKms > 0 ? (
                        <span className="inline-flex items-center gap-1 font-extrabold text-slate-950 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-md text-xs shadow-2xs">
                          <Scissors className="w-3.5 h-3.5 text-slate-800" />
                          <span>{row.rampalKms.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-700 font-extrabold">KMS</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      {row.tebangBtg > 0 ? (
                        <span className="inline-flex items-center gap-1 font-extrabold text-slate-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md text-xs shadow-2xs">
                          <TreePine className="w-3.5 h-3.5 text-amber-800" />
                          <span>{row.tebangBtg}</span>
                          <span className="text-[10px] text-slate-700 font-extrabold">btg</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${getTimBadge(
                          row.tim
                        )}`}
                      >
                        {row.tim}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Filter className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-600">Tidak ada data yang sesuai filter</p>
                    <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau reset filter</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
        <div className="text-xs text-slate-500 font-medium">
          Halaman <span className="font-bold text-slate-800">{validCurrentPage}</span> dari{' '}
          <span className="font-bold text-slate-800">{totalPages}</span> ({sortedRecords.length.toLocaleString('id-ID')} baris)
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={validCurrentPage === 1}
            title="Halaman Pertama"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validCurrentPage === 1}
            title="Halaman Sebelumnya"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Quick Page Indicator */}
          <div className="px-3 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg">
            {validCurrentPage} / {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validCurrentPage === totalPages}
            title="Halaman Berikutnya"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={validCurrentPage === totalPages}
            title="Halaman Terakhir"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
