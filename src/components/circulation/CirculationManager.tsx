import React, { useState } from 'react';
import {
  Repeat,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  BookOpen,
  User,
  Calendar,
  DollarSign,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Book, BookCopy, BorrowTransaction, Student, LibrarySettings } from '../../types';

interface CirculationManagerProps {
  books: Book[];
  copies: BookCopy[];
  students: Student[];
  transactions: BorrowTransaction[];
  settings: LibrarySettings;
  onIssueBook: (
    copyBarcode: string,
    studentIdOrCode: string,
    loanDays?: number,
    notes?: string
  ) => { success: boolean; message: string };
  onReturnBook: (
    transactionId: string,
    condition?: BookCopy['condition']
  ) => { success: boolean; message: string; fineDue: number };
  onSettleFine: (transactionId: string) => void;
  prefilledBarcode?: string | null;
}

export const CirculationManager: React.FC<CirculationManagerProps> = ({
  books,
  copies,
  students,
  transactions,
  settings,
  onIssueBook,
  onReturnBook,
  onSettleFine,
  prefilledBarcode,
}) => {
  const [activeTab, setActiveTab] = useState<'issue' | 'return' | 'history'>('issue');

  // Issue Form State
  const [issueBarcode, setIssueBarcode] = useState(prefilledBarcode || '');
  const [issueStudentCode, setIssueStudentCode] = useState('');
  const [loanDuration, setLoanDuration] = useState(settings.defaultLoanPeriodDays);
  const [issueNotes, setIssueNotes] = useState('');
  const [issueFeedback, setIssueFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Return Form State
  const [returnBarcodeQuery, setReturnBarcodeQuery] = useState('');
  const [selectedReturnTx, setSelectedReturnTx] = useState<BorrowTransaction | null>(null);
  const [returnCondition, setReturnCondition] = useState<BookCopy['condition']>('good');
  const [returnFeedback, setReturnFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // History Tab Filter
  const [historySearch, setHistorySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'borrowed' | 'overdue' | 'returned'>('all');

  // Available copies helper
  const availableCopies = copies.filter((c) => c.status === 'available');

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIssueFeedback(null);
    const result = onIssueBook(issueBarcode, issueStudentCode, loanDuration, issueNotes);
    setIssueFeedback(result);
    if (result.success) {
      setIssueBarcode('');
      setIssueStudentCode('');
      setIssueNotes('');
    }
  };

  const handleSearchReturnCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    setReturnFeedback(null);
    const match = transactions.find(
      (t) =>
        t.status !== 'returned' &&
        t.barcode.toUpperCase() === returnBarcodeQuery.trim().toUpperCase()
    );
    if (match) {
      setSelectedReturnTx(match);
      // Preselect current condition from copies list
      const copy = copies.find((c) => c.id === match.copyId);
      if (copy) setReturnCondition(copy.condition);
    } else {
      setSelectedReturnTx(null);
      setReturnFeedback({
        success: false,
        message: `No active borrowing transaction found for barcode "${returnBarcodeQuery}".`,
      });
    }
  };

  const handleExecuteReturn = () => {
    if (!selectedReturnTx) return;
    const res = onReturnBook(selectedReturnTx.id, returnCondition);
    setReturnFeedback(res);
    setSelectedReturnTx(null);
    setReturnBarcodeQuery('');
  };

  const filteredHistory = transactions.filter((t) => {
    const matchesSearch =
      t.bookTitle.toLowerCase().includes(historySearch.toLowerCase()) ||
      t.barcode.toLowerCase().includes(historySearch.toLowerCase()) ||
      t.studentName.toLowerCase().includes(historySearch.toLowerCase()) ||
      t.studentCode.toLowerCase().includes(historySearch.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Circulation Desk · Issue & Return Control
          </h2>
          <p className="text-xs text-slate-500">
            Authorize new loans, register returned copies, compute fines, and inspect borrowing history
          </p>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-lg text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('issue')}
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              activeTab === 'issue'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Issue Book
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              activeTab === 'return'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Return Book
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Ledger & History ({transactions.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Issue Book */}
      {activeTab === 'issue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Issue Physical Book Copy
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Enter or scan the copy accession barcode and select the borrower student.
            </p>

            {issueFeedback && (
              <div
                className={`p-4 rounded-xl mb-5 flex items-start gap-3 text-xs ${
                  issueFeedback.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {issueFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block">{issueFeedback.success ? 'Transaction Approved' : 'Issue Prevented'}</span>
                  <span className="mt-0.5 block leading-relaxed">{issueFeedback.message}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Barcode Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Book Copy Barcode / Asset ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={issueBarcode}
                    onChange={(e) => setIssueBarcode(e.target.value)}
                    placeholder="e.g. LIB-CS-001-C1"
                    className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Tip: Select a copy below to autofill
                  </span>
                </div>

                {/* Student Code / ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student ID or College Email *
                  </label>
                  <select
                    value={issueStudentCode}
                    onChange={(e) => setIssueStudentCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="">-- Choose registered student --</option>
                    {students.map((s) => (
                      <option
                        key={s.id}
                        value={s.studentId}
                        disabled={s.membershipStatus !== 'active' || s.activeLoansCount >= s.maxBooksAllowed}
                      >
                        {s.name} ({s.studentId}) - {s.department} [{s.activeLoansCount}/{s.maxBooksAllowed} loans]
                        {s.membershipStatus !== 'active' ? ` (${s.membershipStatus.toUpperCase()})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Loan Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={loanDuration}
                    onChange={(e) => setLoanDuration(parseInt(e.target.value) || 14)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Standard college policy: {settings.defaultLoanPeriodDays} days
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Transaction Memo / Notes
                  </label>
                  <input
                    type="text"
                    value={issueNotes}
                    onChange={(e) => setIssueNotes(e.target.value)}
                    placeholder="Semester project, thesis reserve, etc."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-colors"
                >
                  Confirm and Issue Book Copy
                </button>
              </div>
            </form>
          </div>

          {/* Quick Select Available Copies Panel */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Available Copies for Loan ({availableCopies.length})
            </h4>
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {availableCopies.map((copy) => {
                const book = books.find((b) => b.id === copy.bookId);
                return (
                  <div
                    key={copy.id}
                    onClick={() => setIssueBarcode(copy.barcode)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      issueBarcode === copy.barcode
                        ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                      {copy.barcode}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {book?.title || 'Unknown Title'}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                      <span>Condition: {copy.condition}</span>
                      <span>{copy.location}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Return Book */}
      {activeTab === 'return' && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Check-In Returned Book Copy
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Scan or enter the book copy barcode to verify loan dates and compute automated overdue fines.
          </p>

          {returnFeedback && (
            <div
              className={`p-4 rounded-xl mb-5 flex items-start gap-3 text-xs ${
                returnFeedback.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200'
              }`}
            >
              {returnFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <div>
                <span className="font-semibold block">{returnFeedback.success ? 'Return Complete' : 'Notice'}</span>
                <span className="mt-0.5 block leading-relaxed">{returnFeedback.message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSearchReturnCandidate} className="flex gap-2 mb-6">
            <input
              type="text"
              required
              value={returnBarcodeQuery}
              onChange={(e) => setReturnBarcodeQuery(e.target.value)}
              placeholder="Enter or scan barcode (e.g. LIB-CS-001-C2, LIB-CS-001-C4)..."
              className="flex-1 px-3 py-2 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors"
            >
              Lookup Loan
            </button>
          </form>

          {selectedReturnTx && (
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400">
                    {selectedReturnTx.barcode}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedReturnTx.bookTitle}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Borrowed by <strong className="text-slate-800 dark:text-slate-200">{selectedReturnTx.studentName}</strong> ({selectedReturnTx.studentCode})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Issue Date</span>
                  <span className="font-mono text-slate-900 dark:text-white font-medium">
                    {new Date(selectedReturnTx.issueDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Scheduled Due Date</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">
                    {new Date(selectedReturnTx.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Current Fine</span>
                  <span className={`font-mono font-bold ${selectedReturnTx.fineAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {settings.currencySymbol}{selectedReturnTx.fineAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inspect Returned Physical Condition
                </label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="pristine">Pristine / Like New</option>
                  <option value="good">Good (Normal wear)</option>
                  <option value="fair">Fair (Minor marks/creases)</option>
                  <option value="damaged">Damaged (Requires conservation repair)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReturnTx(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReturn}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-colors"
                >
                  Accept Return & Update Inventory
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: History & Circulation Ledger */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search transactions by title, student, barcode..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="py-1.5 px-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">All Transactions</option>
                <option value="borrowed">Active Loans Only</option>
                <option value="overdue">Overdue Only</option>
                <option value="returned">Returned Only</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2.5 px-4 font-semibold">Copy Barcode</th>
                    <th className="py-2.5 px-4 font-semibold">Book Title</th>
                    <th className="py-2.5 px-4 font-semibold">Student</th>
                    <th className="py-2.5 px-4 font-semibold">Issue Date</th>
                    <th className="py-2.5 px-4 font-semibold">Due Date</th>
                    <th className="py-2.5 px-4 font-semibold">Status / Fine</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {tx.barcode}
                      </td>
                      <td className="py-3 px-4 font-semibold max-w-[200px] truncate">
                        {tx.bookTitle}
                      </td>
                      <td className="py-3 px-4">
                        <div>{tx.studentName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{tx.studentCode}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {new Date(tx.issueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {new Date(tx.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {tx.status === 'returned' ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Returned</span>
                        ) : tx.status === 'overdue' ? (
                          <span className="text-rose-600 dark:text-rose-400 font-bold">
                            Overdue (${tx.fineAmount.toFixed(2)})
                          </span>
                        ) : (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">Borrowed</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {tx.status !== 'returned' ? (
                          <button
                            onClick={() => onReturnBook(tx.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 rounded"
                          >
                            Return
                          </button>
                        ) : tx.fineAmount > 0 && !tx.finePaid ? (
                          <button
                            onClick={() => onSettleFine(tx.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded"
                          >
                            Pay Fine
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Clear</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
