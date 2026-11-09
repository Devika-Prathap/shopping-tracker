import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Table, 
  Calendar, 
  TrendingUp, 
  Store, 
  Check, 
  Share2, 
  FileSpreadsheet, 
  ArrowRight, 
  Sparkles,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction } from '../types';

interface ExportReportsViewProps {
  purchases: PurchaseTransaction[];
  onOpenMonthlySummary?: () => void;
}

export const ExportReportsView: React.FC<ExportReportsViewProps> = ({
  purchases,
  onOpenMonthlySummary,
}) => {
  const { formatPrice, currency } = useApp();
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const delivered = purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  const totalSpent = delivered.reduce((sum, p) => sum + p.totalAmount, 0);

  // 1. Export as CSV
  const handleExportCSV = () => {
    try {
      const headers = ['Order Number', 'Date', 'Store', 'Item Name', 'Category', 'Price', 'Status', 'Payment Method'];
      const rows = delivered.flatMap(p => 
        p.items.map(it => [
          p.orderNumber,
          p.date,
          `"${p.store}"`,
          `"${it.name.replace(/"/g, '""')}"`,
          it.category,
          it.price,
          p.orderStatus,
          `"${p.paymentMethod || 'UPI'}"`
        ])
      );

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `trackshop_spending_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setDownloadSuccess('CSV Exported successfully!');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Export as JSON
  const handleExportJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(purchases, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `trackshop_purchases_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setDownloadSuccess('JSON Data File exported successfully!');
      setTimeout(() => setDownloadSuccess(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Simulated Printable Report
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10 dark:from-blue-950/40 dark:via-cyan-950/30 dark:to-emerald-950/20 border border-blue-200/80 dark:border-blue-800/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-1">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Accounting & Fiscal Reporting
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Export Data & Monthly Reports
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Generate and export your transactions, receipts metadata, and category breakdown into Excel-compatible CSV, JSON data archives, or PDF reports.
          </p>
        </div>

        {onOpenMonthlySummary && (
          <button
            onClick={onOpenMonthlySummary}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0"
          >
            <Calendar className="w-4 h-4" />
            <span>Open Visual Monthly Digest</span>
          </button>
        )}
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Export Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CSV Export */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Table className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Export as CSV (Excel)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Compatible with Microsoft Excel, Google Sheets, Apple Numbers, and bookkeeping software. Includes all {delivered.length} active transactions with breakdown.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download .CSV Spreadsheet</span>
          </button>
        </div>

        {/* JSON Backup */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Full JSON Data Backup
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Export raw JSON payload with full schema fidelity (including order IDs, store tags, and price tracking stamps) for developer scripts or cloud backup.
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download .JSON Raw Backup</span>
          </button>
        </div>

        {/* PDF Digest */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Print / Save PDF Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Clean, printer-friendly summary report showing total expenditures ({formatPrice(totalSpent)}), top shopping stores, and category distribution.
            </p>
          </div>

          <button
            onClick={handlePrintPDF}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Snapshot Preview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Active Ingested Dataset Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Delivered</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">{delivered.length} orders</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Spend</span>
            <span className="text-base font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5 block">{formatPrice(totalSpent)}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Connected Stores</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">{new Set(delivered.map(p => p.store)).size} merchants</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Format Standard</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">UTF-8 / ISO 8601</span>
          </div>
        </div>
      </div>
    </div>
  );
};
