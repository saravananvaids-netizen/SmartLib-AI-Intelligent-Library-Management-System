import React from 'react';
import {
  BookOpen,
  Repeat,
  AlertTriangle,
  DollarSign,
  Users,
  QrCode,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { Book, BookCopy, BorrowTransaction, Student, ActivePage, LibrarySettings } from '../../types';

interface LibrarianDashboardProps {
  books: Book[];
  copies: BookCopy[];
  students: Student[];
  transactions: BorrowTransaction[];
  settings: LibrarySettings;
  setActivePage: (page: ActivePage) => void;
  onSelectBook: (bookId: string) => void;
  onReturnBook: (transactionId: string) => void;
  onSettleFine: (transactionId: string) => void;
}

export const LibrarianDashboard: React.FC<LibrarianDashboardProps> = ({
  books,
  copies,
  students,
  transactions,
  settings,
  setActivePage,
  onSelectBook,
  onReturnBook,
  onSettleFine,
}) => {
  const activeLoans = transactions.filter((t) => t.status === 'borrowed');
  const overdueLoans = transactions.filter((t) => t.status === 'overdue');
  const totalFinesDue = transactions
    .filter((t) => !t.finePaid && t.fineAmount > 0)
    .reduce((acc, t) => acc + t.fineAmount, 0);

  const availableCopiesCount = copies.filter((c) => c.status === 'available').length;
  const damagedCopiesCount = copies.filter((c) => c.condition === 'damaged' || c.status === 'maintenance').length;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 text-white p-6 sm:p-8">
        <div className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none">
          <img
            src="/src/assets/images/hero_library_interior_1791987050726.jpg"
            alt="University Library Interior"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Campus Circulation Control</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">
            SmartLib AI Administration Center
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Real-time control over academic physical holdings, automated overdue fines (${settings.finePerDay.toFixed(2)}/day), QR barcode transactions, and AI-grounded student reading recommendations.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActivePage('circulation')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Repeat className="w-4 h-4" />
              <span>Issue / Return Book</span>
            </button>
            <button
              onClick={() => setActivePage('qr_scanner')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition-colors"
            >
              <QrCode className="w-4 h-4 text-teal-400" />
              <span>Launch QR Scanner</span>
            </button>
            <button
              onClick={() => setActivePage('catalog')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Manage Catalog ({books.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Titles */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Catalog Titles</span>
            <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {books.length}
          </p>
          <span className="text-[11px] text-slate-400">Across 6 academic fields</span>
        </div>

        {/* Total Physical Copies */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Copies</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {copies.length}
          </p>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
            {availableCopiesCount} available on shelf
          </span>
        </div>

        {/* Active Loans */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Active Loans</span>
            <Repeat className="w-4 h-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {activeLoans.length}
          </p>
          <span className="text-[11px] text-slate-400">In student possession</span>
        </div>

        {/* Overdue Loans */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Overdue Books</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {overdueLoans.length}
          </p>
          <span className="text-[11px] text-rose-500 font-medium">Requires reminder</span>
        </div>

        {/* Outstanding Fines */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Accrued Fines</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {settings.currencySymbol}{totalFinesDue.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400">${settings.finePerDay}/day rate</span>
        </div>

        {/* Registered Students */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Active Students</span>
            <Users className="w-4 h-4 text-teal-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {students.length}
          </p>
          <span className="text-[11px] text-slate-400">All departments</span>
        </div>
      </div>

      {/* Main Content Split: Recent Transactions + Circulation Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active & Overdue Borrow Transactions (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Borrowing & Circulation Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Track loaned items, calculate automated fines, and execute returns
              </p>
            </div>
            <button
              onClick={() => setActivePage('circulation')}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
            >
              <span>Full Circulation Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2.5 px-4 font-semibold">Book & Barcode</th>
                  <th className="py-2.5 px-4 font-semibold">Student</th>
                  <th className="py-2.5 px-4 font-semibold">Due Date</th>
                  <th className="py-2.5 px-4 font-semibold">Status / Fine</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {transactions.slice(0, 6).map((tx) => {
                  const isOverdue = tx.status === 'overdue';
                  const isReturned = tx.status === 'returned';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                          {tx.bookTitle}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {tx.barcode}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {tx.studentName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {tx.studentCode}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono whitespace-nowrap">
                        {new Date(tx.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Returned</span>
                          </span>
                        ) : isOverdue ? (
                          <div className="inline-flex flex-col">
                            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                              Overdue
                            </span>
                            <span className="text-[11px] font-mono text-rose-500 font-bold">
                              Fine: {settings.currencySymbol}{tx.fineAmount.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Borrowed</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isReturned ? (
                          <button
                            onClick={() => onReturnBook(tx.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:hover:bg-teal-900/70 dark:text-teal-300 rounded transition-colors"
                          >
                            Return
                          </button>
                        ) : tx.fineAmount > 0 && !tx.finePaid ? (
                          <button
                            onClick={() => onSettleFine(tx.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded transition-colors"
                          >
                            Pay Fine
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Inventory & AI Quick Action Sidebar */}
        <div className="space-y-6">
          {/* Inventory Health & Low Stock Alert */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Inventory Health & Shelf Alerts
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time copy availability and maintenance status
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    On-Shelf Available
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  {availableCopiesCount} copies
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Currently Issued
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  {activeLoans.length + overdueLoans.length} copies
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Maintenance / Repair
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  {damagedCopiesCount} copies
                </span>
              </div>
            </div>

            <button
              onClick={() => setActivePage('catalog')}
              className="w-full mt-4 py-2 px-3 text-xs font-semibold text-center text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
            >
              Inspect All Physical Barcodes
            </button>
          </div>

          {/* AI Features Spotlight */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-white">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>SmartLib AI Engines</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Intelligent Student Support
            </h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Generate course-specific recommendations or summarize syllabus books using Gemini.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActivePage('ai_recommendations')}
                className="p-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-left text-xs transition-colors"
              >
                <span className="font-semibold block text-teal-300">Book Advisor</span>
                <span className="text-[11px] text-slate-400">Course match</span>
              </button>
              <button
                onClick={() => setActivePage('ai_summarizer')}
                className="p-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-left text-xs transition-colors"
              >
                <span className="font-semibold block text-teal-300">Summarizer</span>
                <span className="text-[11px] text-slate-400">Key takeaways</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
