import React, { useState } from 'react';
import {
  X,
  BookOpen,
  QrCode,
  Sparkles,
  Repeat,
  BookmarkCheck,
  Plus,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Book, BookCopy, User } from '../../types';

interface BookDetailsModalProps {
  book: Book;
  copies: BookCopy[];
  currentUser: User;
  onClose: () => void;
  onIssueCopy: (barcode: string) => void;
  onAddCopy: (bookId: string) => void;
  onAddToReadingList: (book: Book) => void;
  onOpenSummarizer: (book: { title: string; author: string; description: string }) => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  book,
  copies,
  currentUser,
  onClose,
  onIssueCopy,
  onAddCopy,
  onAddToReadingList,
  onOpenSummarizer,
}) => {
  const isLibrarian = currentUser.role === 'librarian';
  const bookCopies = copies.filter((c) => c.bookId === book.id);
  const [selectedBarcodeForQr, setSelectedBarcodeForQr] = useState<string | null>(null);
  const [copiedBarcode, setCopiedBarcode] = useState<string | null>(null);

  const handleCopyBarcode = (barcode: string) => {
    navigator.clipboard.writeText(barcode);
    setCopiedBarcode(barcode);
    setTimeout(() => setCopiedBarcode(null), 2000);
  };

  const getConditionColor = (cond: BookCopy['condition']) => {
    switch (cond) {
      case 'pristine':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'good':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300';
      case 'fair':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300';
      case 'damaged':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusColor = (status: BookCopy['status']) => {
    switch (status) {
      case 'available':
        return 'text-emerald-600 font-semibold';
      case 'issued':
        return 'text-blue-600 font-medium';
      case 'reserved':
        return 'text-purple-600 font-medium';
      case 'maintenance':
        return 'text-rose-600 font-medium';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Book Header Split */}
        <div className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-32 h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 shrink-0 mx-auto sm:mx-0">
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 text-xs text-teal-600 dark:text-teal-400 font-semibold">
              <span>{book.genre}</span>
              <span>·</span>
              <span>{book.category}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {book.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              by <span className="font-semibold text-slate-900 dark:text-white">{book.author}</span>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">ISBN</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{book.isbn}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Published</span>
                <span className="font-mono text-slate-900 dark:text-white">{book.publishedYear}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Shelf Stack</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">{book.shelfLocation}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Availability</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {book.availableCopies} of {book.totalCopies} Available
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() =>
                  onOpenSummarizer({
                    title: book.title,
                    author: book.author,
                    description: book.description,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-600 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Summary</span>
              </button>

              <button
                onClick={() => onAddToReadingList(book)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-teal-500" />
                <span>Add to My Reading List</span>
              </button>

              {isLibrarian && (
                <button
                  onClick={() => onAddCopy(book.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Extra Physical Copy</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Book Description */}
        <div className="py-4 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Academic Synopsis & Syllabus Context
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {book.description}
          </p>
        </div>

        {/* Physical Copies / Inventory Tracker */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Physical Inventory Copies ({bookCopies.length})
              </h4>
              <p className="text-xs text-slate-500">
                Individual accession barcodes, copy condition, and active loan status
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2.5 px-3 font-semibold">Copy Barcode</th>
                  <th className="py-2.5 px-3 font-semibold">Condition</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Location</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {bookCopies.map((copy) => (
                  <tr key={copy.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{copy.barcode}</span>
                        <button
                          onClick={() => handleCopyBarcode(copy.barcode)}
                          title="Copy barcode"
                          className="text-slate-400 hover:text-slate-700"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {copiedBarcode === copy.barcode && (
                          <span className="text-[10px] text-teal-600">Copied!</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${getConditionColor(copy.condition)}`}>
                        {copy.condition}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`capitalize ${getStatusColor(copy.status)}`}>
                        {copy.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate max-w-[150px]">
                      {copy.location}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedBarcodeForQr(copy.barcode)}
                        className="p-1 text-slate-500 hover:text-teal-600 transition-colors mr-2"
                        title="View QR Code"
                      >
                        <QrCode className="w-4 h-4 inline" />
                      </button>

                      {isLibrarian && copy.status === 'available' && (
                        <button
                          onClick={() => {
                            onClose();
                            onIssueCopy(copy.barcode);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded transition-colors"
                        >
                          Issue Copy
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QR Code Inspection Modal Overlay */}
        {selectedBarcodeForQr && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center shadow-2xl">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Library Book Asset Tag
                </span>
                <button
                  onClick={() => setSelectedBarcodeForQr(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* QR Code SVG */}
              <div className="p-4 bg-white rounded-xl inline-block shadow-inner border border-slate-200 mb-3">
                <QRCodeSVG
                  value={selectedBarcodeForQr}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                {selectedBarcodeForQr}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Scan this tag at the self-service checkout kiosk or with the Librarian QR Scanner to initiate transactions.
              </p>

              <button
                onClick={() => setSelectedBarcodeForQr(null)}
                className="mt-5 w-full py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close Tag
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
