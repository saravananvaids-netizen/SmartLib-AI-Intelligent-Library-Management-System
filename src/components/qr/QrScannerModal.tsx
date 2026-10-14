import React, { useState } from 'react';
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertCircle,
  Repeat,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Book, BookCopy, BorrowTransaction, ActivePage } from '../../types';

interface QrScannerModalProps {
  books: Book[];
  copies: BookCopy[];
  transactions: BorrowTransaction[];
  onNavigateToIssue: (barcode: string) => void;
  onNavigateToReturn: (barcode: string) => void;
  onSelectBook: (bookId: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  books,
  copies,
  transactions,
  onNavigateToIssue,
  onNavigateToReturn,
  onSelectBook,
}) => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'generator'>('scanner');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    found: boolean;
    copy?: BookCopy;
    book?: Book;
    activeLoan?: BorrowTransaction;
  } | null>(null);

  // Generator State
  const [generatorCopyBarcode, setGeneratorCopyBarcode] = useState(copies[0]?.barcode || 'LIB-CS-001-C1');

  const executeBarcodeLookup = (barcode: string) => {
    setIsScanning(true);
    setScannedBarcode(barcode);

    setTimeout(() => {
      setIsScanning(false);
      const clean = barcode.trim().toUpperCase();
      const copy = copies.find((c) => c.barcode.toUpperCase() === clean);

      if (!copy) {
        setScanResult({ found: false });
        return;
      }

      const book = books.find((b) => b.id === copy.bookId);
      const activeLoan = transactions.find((t) => t.copyId === copy.id && t.status !== 'returned');

      setScanResult({
        found: true,
        copy,
        book,
        activeLoan,
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Library QR Code & Barcode Terminal
          </h2>
          <p className="text-xs text-slate-500">
            Scan physical book accession tags to retrieve real-time inventory records or print new QR asset tags
          </p>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-lg text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors ${
              activeTab === 'scanner'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-teal-500" />
            <span>Interactive Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors ${
              activeTab === 'generator'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-500" />
            <span>QR Tag Generator</span>
          </button>
        </div>
      </div>

      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scanner Viewport (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-white relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                  <Camera className="w-4 h-4" />
                  <span>Optical Tag Reader</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Kiosk Optical Mode
                </span>
              </div>

              {/* Viewfinder Frame with animated laser */}
              <div className="relative w-full h-64 sm:h-72 rounded-xl bg-slate-950 border-2 border-dashed border-teal-500/40 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                {/* Laser scan line */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_12px_#2dd4bf] animate-[bounce_2s_infinite]" />

                <QrCode className="w-16 h-16 text-teal-500/30 mb-3" />
                <p className="text-xs font-medium text-slate-300">
                  Align library barcode or QR tag within the optical frame
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Or select any sample accession barcode chip below to test instant lookup
                </p>

                {isScanning && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center gap-2 text-teal-400 text-xs font-semibold">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Decoding optical barcode matrix...</span>
                  </div>
                )}
              </div>

              {/* Manual Input Fallback */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={scannedBarcode}
                  onChange={(e) => setScannedBarcode(e.target.value)}
                  placeholder="Enter barcode string (e.g. LIB-CS-001-C2)..."
                  className="flex-1 px-3 py-2 text-xs font-mono uppercase bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  onClick={() => executeBarcodeLookup(scannedBarcode)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors"
                >
                  Scan Code
                </button>
              </div>

              {/* Quick Sample Barcodes */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block mb-2">
                  Sample Barcodes for Quick Testing:
                </span>
                <div className="flex flex-wrap gap-2">
                  {copies.slice(0, 6).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => executeBarcodeLookup(c.barcode)}
                      className="px-2.5 py-1 text-[11px] font-mono font-medium rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                    >
                      {c.barcode} ({c.status})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scanner Lookup Results (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Decoded Asset Record
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Physical copy verified against university catalog
                </p>

                {!scanResult ? (
                  <div className="py-12 text-center text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-xs">No barcode scanned yet.</p>
                    <p className="text-[11px] mt-1">
                      Scan an item tag on the left to review status.
                    </p>
                  </div>
                ) : !scanResult.found ? (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Unregistered Barcode</span>
                    </div>
                    <span>
                      The code &ldquo;{scannedBarcode}&rdquo; is not registered in the library holdings.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Book & Copy Lockup */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-start gap-3">
                        {scanResult.book?.coverUrl && (
                          <img
                            src={scanResult.book.coverUrl}
                            alt={scanResult.book.title}
                            className="w-12 h-16 object-cover rounded shadow-xs shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                            {scanResult.copy?.barcode}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {scanResult.book?.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            by {scanResult.book?.author}
                          </p>
                          <div className="text-[11px] font-mono text-slate-400 mt-1">
                            Shelf: {scanResult.copy?.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status & Condition Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 block">Inventory Status</span>
                        <span
                          className={`font-semibold capitalize ${
                            scanResult.copy?.status === 'available'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600'
                          }`}
                        >
                          {scanResult.copy?.status}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 block">Physical Condition</span>
                        <span className="font-semibold uppercase text-slate-900 dark:text-white">
                          {scanResult.copy?.condition}
                        </span>
                      </div>
                    </div>

                    {/* Active loan details if borrowed */}
                    {scanResult.activeLoan && (
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
                        <span className="font-bold text-blue-900 dark:text-blue-300 block mb-0.5">
                          Currently Checked Out
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                          Borrower: {scanResult.activeLoan.studentName} ({scanResult.activeLoan.studentCode})
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] font-mono">
                          Due Date: {new Date(scanResult.activeLoan.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons if copy found */}
              {scanResult?.found && scanResult.copy && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  {scanResult.copy.status === 'available' ? (
                    <button
                      onClick={() => onNavigateToIssue(scanResult.copy!.barcode)}
                      className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Repeat className="w-4 h-4" />
                      <span>Proceed to Issue This Copy</span>
                    </button>
                  ) : scanResult.activeLoan ? (
                    <button
                      onClick={() => onNavigateToReturn(scanResult.copy!.barcode)}
                      className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Check-In & Return This Copy</span>
                    </button>
                  ) : null}

                  {scanResult.book && (
                    <button
                      onClick={() => onSelectBook(scanResult.book!.id)}
                      className="w-full py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Inspect Full Catalog Record
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: QR Tag Generator */}
      {activeTab === 'generator' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Printable Book Accession Tag Generator
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Generate high-resolution SVG QR codes for physical book spines, back covers, and inventory audits.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Physical Copy Barcode
              </label>
              <select
                value={generatorCopyBarcode}
                onChange={(e) => setGeneratorCopyBarcode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {copies.map((c) => {
                  const b = books.find((book) => book.id === c.bookId);
                  return (
                    <option key={c.id} value={c.barcode}>
                      {c.barcode} — {b?.title} ({c.condition})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Rendered Printable Tag */}
            <div className="p-8 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center text-center">
              <div className="p-4 bg-white rounded-xl shadow-md border border-slate-200 mb-3">
                <QRCodeSVG
                  value={generatorCopyBarcode}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="font-mono text-base font-extrabold text-slate-900 dark:text-white tracking-wider">
                {generatorCopyBarcode}
              </div>
              <div className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                SMARTLIB AI · UNIVERSITY LIBRARY SYSTEM
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Property of College Library · Scannable at Circulation Desks & Kiosks
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors"
            >
              Print Accession Label Sheet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
