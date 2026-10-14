import React, { useState } from 'react';
import {
  AlertTriangle,
  DollarSign,
  Send,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ShieldAlert,
} from 'lucide-react';
import { BorrowTransaction, LibraryNotification, LibrarySettings, Student } from '../../types';

interface OverdueFinesProps {
  transactions: BorrowTransaction[];
  students: Student[];
  settings: LibrarySettings;
  onSettleFine: (transactionId: string) => void;
  onSendReminder: (studentId: string, bookTitle: string, dueDate: string) => void;
}

export const OverdueFines: React.FC<OverdueFinesProps> = ({
  transactions,
  students,
  settings,
  onSettleFine,
  onSendReminder,
}) => {
  const [search, setSearch] = useState('');
  const [notificationSentMap, setNotificationSentMap] = useState<Record<string, boolean>>({});

  const overdueList = transactions.filter((t) => t.status === 'overdue' || (t.status === 'borrowed' && new Date(t.dueDate).getTime() < Date.now()));
  const totalOverdueFines = overdueList.reduce((sum, t) => sum + (t.finePaid ? 0 : t.fineAmount), 0);

  const filteredOverdue = overdueList.filter(
    (t) =>
      t.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.studentName.toLowerCase().includes(search.toLowerCase()) ||
      t.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      t.barcode.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendReminderClick = (tx: BorrowTransaction) => {
    onSendReminder(tx.studentId, tx.bookTitle, tx.dueDate);
    setNotificationSentMap((prev) => ({ ...prev, [tx.id]: true }));
    setTimeout(() => {
      setNotificationSentMap((prev) => ({ ...prev, [tx.id]: false }));
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Overdue Books & Automated Fine Calculator
        </h2>
        <p className="text-xs text-slate-500">
          Enforce college library borrowing limits, calculate daily fines (${settings.finePerDay.toFixed(2)}/day), and dispatch return reminders
        </p>
      </div>

      {/* Policy & Rules Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Fine Rate Policy</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {settings.currencySymbol}{settings.finePerDay.toFixed(2)}
            <span className="text-xs font-normal text-slate-400"> / day per book</span>
          </p>
          <span className="text-[11px] text-slate-400 font-mono">
            {settings.gracePeriodDays} day grace period before assessment
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Overdue Items Count</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {overdueList.length}
          </p>
          <span className="text-[11px] text-slate-400">
            Across {new Set(overdueList.map((t) => t.studentId)).size} distinct students
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Outstanding Accrual</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {settings.currencySymbol}{totalOverdueFines.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400">
            Unpaid fines currently assessed
          </span>
        </div>
      </div>

      {/* Overdue Table */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter overdue records by student, title, or barcode..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <th className="py-2.5 px-4 font-semibold">Student Borrower</th>
                <th className="py-2.5 px-4 font-semibold">Overdue Book & Tag</th>
                <th className="py-2.5 px-4 font-semibold">Due Date</th>
                <th className="py-2.5 px-4 font-semibold">Days Overdue</th>
                <th className="py-2.5 px-4 font-semibold">Fine Accrued</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredOverdue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No overdue books currently recorded! All loans are on schedule.
                  </td>
                </tr>
              ) : (
                filteredOverdue.map((tx) => {
                  const dueDate = new Date(tx.dueDate);
                  const diffMs = Date.now() - dueDate.getTime();
                  const overdueDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
                  const isSent = notificationSentMap[tx.id];

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {tx.studentName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {tx.studentCode} · {tx.studentEmail}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white max-w-[220px] truncate">
                          {tx.bookTitle}
                        </div>
                        <div className="text-[11px] font-mono text-teal-600 dark:text-teal-400">
                          {tx.barcode}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        {dueDate.toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-rose-600">
                        {overdueDays} days
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {settings.currencySymbol}{tx.fineAmount.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleSendReminderClick(tx)}
                          disabled={isSent}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded mr-2 transition-colors ${
                            isSent
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                          }`}
                          title="Send In-App Due Date Reminder"
                        >
                          {isSent ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Reminder Sent</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3 text-teal-600" />
                              <span>Send Reminder</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onSettleFine(tx.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded transition-colors"
                        >
                          Settle / Clear
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
