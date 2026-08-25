import React, { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useBasin } from '../../hooks/useBasin';
import { useLanguage } from '../../hooks/useLanguage';
import { fetchSituationBulletin, getSituationBulletin } from '../../services/alertService';
import { SituationBulletin } from '../../types/alert';
import { DailyBulletin } from '../../components/report/DailyBulletin';
import { Printer, FileSpreadsheet, Check, RefreshCw } from 'lucide-react';

export function SituationReportPage() {
  const { basinSlug } = useParams({ strict: false }) as { basinSlug?: string };
  const currentSlug = basinSlug || 'yom';
  const { basin } = useBasin(currentSlug);
  const { isThai } = useLanguage();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [bulletin, setBulletin] = useState<SituationBulletin>(() => getSituationBulletin(currentSlug));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchSituationBulletin(currentSlug).then((data) => {
      if (isMounted) {
        setBulletin(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentSlug]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    // Generate sample telemetry CSV
    const rows = [
      ['Station_ID', 'Station_Code', 'Station_Name_TH', 'Station_Type', 'Water_Level_MSL', 'Discharge_m3s', 'Rain_24h_mm', 'Status', 'Updated_At'],
      ['Y-0014', 'Y.14', 'ศรีสัชนาลัย', 'water_level', '5.82', '285', '-', 'warning', '2026-08-22 18:05:00'],
      ['Y-0020', 'Y.20', 'บ้านห้วยสัก', 'water_level', '184.20', '340', '-', 'watch', '2026-08-22 18:05:00'],
      ['Y-0001C', 'Y.1C', 'บ้านน้ำโค้ง', 'water_level', '153.80', '420', '-', 'watch', '2026-08-22 18:05:00'],
      ['Y-0003A', 'Y.3A', 'เมืองสุโขทัย', 'water_level', '50.15', '310', '-', 'watch', '2026-08-22 18:05:00'],
      ['Y-0006', 'Y.6', 'บางระกำ', 'water_level', '41.20', '240', '-', 'normal', '2026-08-22 18:00:00'],
      ['621', 'PKTI', 'ทต.พรานกระต่าย', 'rainfall', '-', '-', '88.5', 'warning', '2026-08-22 18:00:00'],
      ['P-0004', 'P.04', 'สะเอียบ', 'rainfall', '-', '-', '124.0', 'critical', '2026-08-22 18:00:00'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `water_situation_${currentSlug}_20260822.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('CSV Export Completed');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      
      {/* Top Action Toolbar (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white/95 dark:bg-background-card/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-md dark:shadow-xl print:hidden transition-colors">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            {isThai ? 'ส่งออกรายงานสถานการณ์น้ำ' : 'Export Situation Bulletin'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            {isThai
              ? 'รองรับการพิมพ์ออกเอกสารทางการ (Print to PDF) และส่งออกข้อมูลโทรมาตร CSV'
              : 'Export as official printable document or download raw telemetry CSV.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isThai ? 'ส่งออก CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isThai ? 'พิมพ์รายงาน / PDF' : 'Print / PDF'}</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 print:hidden shadow-xs">
          <Check className="w-4 h-4" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Official Bulletin Component */}
      <DailyBulletin bulletin={bulletin} />

    </div>
  );
}
