import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GarduRecord, FilterState, DashboardMetrics } from '../types';

interface PDFExportOptions {
  records: GarduRecord[];
  filters: FilterState;
  metrics: DashboardMetrics;
  filename?: string;
}

export function exportToPDF({ records, filters, metrics, filename }: PDFExportOptions): void {
  // Create landscape A4 document for rich tabular representation
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Color palette
  const plnBlue = [0, 91, 150]; // #005b96
  const darkNavy = [15, 23, 42]; // #0f172a
  const textGray = [100, 116, 139]; // #64748b
  const accentRed = [220, 38, 38]; // #dc2626
  const accentEmerald = [16, 185, 129]; // #10b981
  const bgLight = [248, 250, 252]; // #f8fafc

  // Sort records: Overload first, then highest % beban descending
  const sortedRecords = [...records].sort((a, b) => (b.beban_pct || 0) - (a.beban_pct || 0));

  // Cap at 500 rows for smooth client-side PDF generation if entire dataset (5,200+) is passed
  const maxRows = 500;
  const isCapped = sortedRecords.length > maxRows;
  const displayedRecords = isCapped ? sortedRecords.slice(0, maxRows) : sortedRecords;

  // Header Banner
  doc.setFillColor(plnBlue[0], plnBlue[1], plnBlue[2]);
  doc.rect(0, 0, pageWidth, 22, 'F');

  // PLN Logo & Brand Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PT PLN (PERSERO) UID SULSELRABAR - UP3 BULUKUMBA', 14, 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('LAPORAN HASIL PENGUKURAN BEBAN & MONITORING KESEHATAN GARDU DISTRIBUSI', 14, 15);

  // Timestamp on top right
  const printDate = new Date();
  const formattedDate = printDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = printDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.setFontSize(8);
  doc.text(`Waktu Cetak: ${formattedDate}, ${formattedTime} WITA`, pageWidth - 14, 12, { align: 'right' });

  // Executive Summary Card / Bento Tile in PDF
  const cardY = 27;
  const cardHeight = 22;
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, cardY, pageWidth - 28, cardHeight, 2, 2, 'FD');

  // Summary Metrics inside Card
  const colWidth = (pageWidth - 28) / 5;

  // Col 1: Total & Sample
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('TOTAL SAMPEL GARDU', 18, cardY + 6);
  doc.setFontSize(12);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`${records.length.toLocaleString()} Unit`, 18, cardY + 13);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text(isCapped ? `(Dicetak ${maxRows} gardu teratas)` : 'Semua data sesuai filter', 18, cardY + 18);

  // Col 2: Overload (>80%)
  const col2X = 14 + colWidth;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(accentRed[0], accentRed[1], accentRed[2]);
  doc.text('OVERLOAD (> 80%)', col2X + 4, cardY + 6);
  doc.setFontSize(12);
  doc.text(`${metrics.overload.toLocaleString()} Unit`, col2X + 4, cardY + 13);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  const ovrPct = records.length > 0 ? Math.round((metrics.overload / records.length) * 100) : 0;
  doc.text(`${ovrPct}% dari total gardu aktif`, col2X + 4, cardY + 18);

  // Col 3: Normal (40-80%)
  const col3X = 14 + colWidth * 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(accentEmerald[0], accentEmerald[1], accentEmerald[2]);
  doc.text('NORMAL (40 - 80%)', col3X + 4, cardY + 6);
  doc.setFontSize(12);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`${metrics.normal.toLocaleString()} Unit`, col3X + 4, cardY + 13);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  const normPct = records.length > 0 ? Math.round((metrics.normal / records.length) * 100) : 0;
  doc.text(`${normPct}% kapasitas optimal`, col3X + 4, cardY + 18);

  // Col 4: Underload (<40%)
  const col4X = 14 + colWidth * 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('UNDERLOAD (< 40%)', col4X + 4, cardY + 6);
  doc.setFontSize(12);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`${metrics.underload.toLocaleString()} Unit`, col4X + 4, cardY + 13);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text('Potensi relokasi kapasitas', col4X + 4, cardY + 18);

  // Col 5: Parameter Kesehatan
  const col5X = 14 + colWidth * 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('INDIKATOR KESEHATAN', col5X + 4, cardY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text(`Rata2 Beban: ${metrics.avgBeban}%`, col5X + 4, cardY + 11);
  doc.text(`Rata2 Unbalance: ${metrics.avgUnbalance}%`, col5X + 4, cardY + 15);
  doc.text(`Arde >5Ω: ${metrics.groundingNonCompliant} Unit`, col5X + 4, cardY + 19);

  // Active filter disclaimer text
  const filterDesc = [
    filters.ulp !== 'ALL' ? `ULP: ${filters.ulp}` : 'Semua ULP',
    filters.penyulang !== 'ALL' ? `Penyulang: ${filters.penyulang}` : null,
    filters.status !== 'ALL' ? `Status: ${filters.status}` : null,
    filters.kapasitas !== 'ALL' ? `Kapasitas: ${filters.kapasitas} kVA` : null,
    filters.search ? `Cari: "${filters.search}"` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text(`Parameter Filter: ${filterDesc}${isCapped ? ` • Diurutkan berdasarkan beban tertinggi (Maks ${maxRows} baris)` : ''}`, 14, 53);

  // Build Table Rows
  const tableData = displayedRecords.map((r, index) => {
    const coordsStr = r.lat && r.lng ? `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}` : '-';
    const ardeStr = r.pembumian > 0 ? `${r.pembumian} Ω` : '-';
    return [
      (index + 1).toString(),
      r.gardu,
      r.ulp,
      r.penyulang || '-',
      `${r.kapasitas}`,
      `${r.beban_pct}%`,
      r.status_beban,
      `${r.unbalance_pct}%`,
      `${r.ir}/${r.is}/${r.it}`,
      `${r.in}`,
      `${r.vfn}/${r.vff}`,
      ardeStr,
      coordsStr,
    ];
  });

  // Table using autoTable
  autoTable(doc, {
    startY: 56,
    head: [
      [
        'No',
        'Nama Gardu',
        'ULP',
        'Penyulang',
        'kVA',
        '% Beban',
        'Status',
        '% Unb',
        'Arus R/S/T (A)',
        'Arus N (A)',
        'V (FN/FF)',
        'Arde',
        'Koordinat GPS',
      ],
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 1.8,
      valign: 'middle',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 }, // No
      1: { fontStyle: 'bold', cellWidth: 28 }, // Gardu
      2: { cellWidth: 26 }, // ULP
      3: { cellWidth: 26 }, // Penyulang
      4: { halign: 'right', cellWidth: 12 }, // kVA
      5: { halign: 'right', fontStyle: 'bold', cellWidth: 15 }, // % Beban
      6: { halign: 'center', fontStyle: 'bold', cellWidth: 20 }, // Status
      7: { halign: 'right', cellWidth: 13 }, // % Unb
      8: { halign: 'center', cellWidth: 32 }, // Arus R/S/T
      9: { halign: 'right', cellWidth: 16 }, // Arus N
      10: { halign: 'center', cellWidth: 24 }, // Tegangan
      11: { halign: 'right', cellWidth: 16 }, // Arde
      12: { halign: 'center', cellWidth: 30 }, // Koordinat GPS
    },
    didParseCell: (data) => {
      // Highlight Overload rows and badges
      if (data.section === 'body') {
        const rowData = displayedRecords[data.row.index];
        if (rowData) {
          if (data.column.index === 5 || data.column.index === 6) {
            if (rowData.status_beban === 'OVERLOAD') {
              data.cell.styles.textColor = [220, 38, 38]; // Red
              data.cell.styles.fontStyle = 'bold';
            } else if (rowData.status_beban === 'UNDERLOAD') {
              data.cell.styles.textColor = [2, 132, 199]; // Blue
            } else {
              data.cell.styles.textColor = [5, 150, 105]; // Emerald
            }
          }
          if (data.column.index === 7 && rowData.unbalance_pct > 30) {
            data.cell.styles.textColor = [217, 119, 6]; // Amber
            data.cell.styles.fontStyle = 'bold';
          }
          if (data.column.index === 11 && rowData.pembumian > 5) {
            data.cell.styles.textColor = [217, 119, 6]; // Amber
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    },
    didDrawPage: (data) => {
      // Page Footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);

      // Left footer
      doc.text(
        'PT PLN (Persero) UP3 Bulukumba • Sistem Monitoring Pengukuran Gardu Distribusi',
        14,
        pageHeight - 6
      );

      // Right footer
      doc.text(
        `Halaman ${data.pageNumber} dari ${totalPages}`,
        pageWidth - 14,
        pageHeight - 6,
        { align: 'right' }
      );
    },
    margin: { top: 56, bottom: 12, left: 14, right: 14 },
  });

  // Save document
  const defaultFilename = `laporan_pengukuran_gardu_PLN_UP3_Bulukumba_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename || defaultFilename);
}

export function exportSingleGarduPDF(gardu: GarduRecord): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const plnBlue = [0, 91, 150];
  const darkNavy = [15, 23, 42];
  const textGray = [100, 116, 139];

  // Header Banner
  doc.setFillColor(plnBlue[0], plnBlue[1], plnBlue[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PT PLN (PERSERO) UID SULSELRABAR', 14, 10);
  doc.setFontSize(11);
  doc.text('UP3 BULUKUMBA - LEMBAR INSPEKSI & PENGUKURAN GARDU', 14, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')}`, 14, 23);

  // Substation Title Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 34, pageWidth - 28, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`GARDU: ${gardu.gardu}`, 20, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  doc.text(`ULP: ${gardu.ulp}   |   Penyulang: ${gardu.penyulang || '-'}   |   Tipe: ${gardu.tipe || 'UMUM'}`, 20, 52);

  // Technical Parameter Table
  const techData = [
    ['Kapasitas Trafo', `${gardu.kapasitas} kVA (${gardu.fasa} Fasa)`, 'Daya Terukur (Beban)', `${gardu.beban_kva} kVA`],
    ['Persentase Beban', `${gardu.beban_pct}% (${gardu.status_beban})`, 'Ketidakseimbangan (% Unbalance)', `${gardu.unbalance_pct}%`],
    ['Arus Fasa R', `${gardu.ir} A`, 'Arus Fasa S', `${gardu.is} A`],
    ['Arus Fasa T', `${gardu.it} A`, 'Arus Netral (N)', `${gardu.in} A`],
    ['Tegangan Fasa-Netral (VFN)', `${gardu.vfn} Volt`, 'Tegangan Fasa-Fasa (VFF)', `${gardu.vff} Volt`],
    ['Tahanan Pembumian (Arde)', `${gardu.pembumian > 0 ? `${gardu.pembumian} Ω` : '-'}`, 'Batas Standar Arde', '≤ 5 Ω (SPLN)'],
    ['Koordinat Geografis (GPS)', `${gardu.lat && gardu.lng ? `${gardu.lat}, ${gardu.lng}` : 'Belum terdata'}`, 'Zona Jaringan', `${gardu.zona || '-'}`],
  ];

  autoTable(doc, {
    startY: 63,
    head: [['Parameter Operasional', 'Nilai Terukur', 'Parameter Tambahan', 'Keterangan']],
    body: techData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, fillColor: [248, 250, 252] },
      1: { cellWidth: 46 },
      2: { fontStyle: 'bold', cellWidth: 45, fillColor: [248, 250, 252] },
      3: { cellWidth: 46 },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 130;

  // Visual Inspection Table
  const visualData = [
    ['Kebocoran Minyak Trafo', gardu.kebocoran_minyak || 'Normal / Kering'],
    ['Kondisi Fisik Trafo', gardu.kondisi_fisik || 'Baik / Bersih'],
    ['Kesesuaian Ampere Proteksi', gardu.kesesuaian_ampere || 'Sesuai Standar'],
    ['Kondisi LVSB / PHB-TR', gardu.kondisi_lvsb || 'Boks Terkunci & Bersih'],
    ['Lightning Arrester', gardu.arrester || 'Lengkap & Terhubung Ground'],
    ['Fuse Cut Out (FCO)', gardu.fco || 'Lengkap & Rating Sesuai'],
    ['Petugas Pelaksana', gardu.petugas || 'Tim Operasi & Pemeliharaan'],
    ['Tanggal Pengukuran', `${gardu.timestamp || gardu.date || '-'}`],
  ];

  autoTable(doc, {
    startY: finalY + 8,
    head: [['Pemeriksaan Fisik & Visual', 'Status / Temuan di Lapangan']],
    body: visualData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 91, 150],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60, fillColor: [248, 250, 252] },
      1: { cellWidth: 122 },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY2 = (doc as any).lastAutoTable.finalY || 190;

  // Catatan Pengukuran / Jurusan JTR
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('CATATAN PENGUKURAN JURUSAN (JTR) & TINDAK LANJUT:', 14, finalY2 + 8);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, finalY2 + 11, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const keteranganLines = doc.splitTextToSize(
    gardu.keterangan || 'Tidak ada catatan anomali khusus pada jurusan gardu.',
    pageWidth - 36
  );
  doc.text(keteranganLines, 18, finalY2 + 17);

  // Signature Block
  const sigY = pageHeight - 35;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);

  doc.text('Mengetahui / Penanggung Jawab,', 25, sigY);
  doc.text('Petugas Pelaksana Ukur,', pageWidth - 70, sigY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('( Supervisor Operasi & Pemeliharaan )', 20, sigY + 22);
  doc.text(`( ${gardu.petugas || 'Petugas Ukur'} )`, pageWidth - 70, sigY + 22);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Dokumen Resmi Hasil Pengukuran Gardu Distribusi • PT PLN (Persero) UP3 Bulukumba', 14, pageHeight - 6);

  doc.save(`laporan_gardu_${gardu.gardu}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
