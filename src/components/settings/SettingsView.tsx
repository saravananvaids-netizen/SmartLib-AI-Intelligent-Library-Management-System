import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Database,
  Bell,
  RefreshCcw,
  CheckCircle2,
  DollarSign,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { LibrarySettings, User } from '../../types';

interface SettingsViewProps {
  settings: LibrarySettings;
  setSettings: React.Dispatch<React.SetStateAction<LibrarySettings>>;
  currentUser: User;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  setSettings,
  currentUser,
  onResetAllData,
}) => {
  const isLibrarian = currentUser.role === 'librarian';

  const [finePerDay, setFinePerDay] = useState(settings.finePerDay);
  const [loanPeriod, setLoanPeriod] = useState(settings.defaultLoanPeriodDays);
  const [maxBooks, setMaxBooks] = useState(settings.maxBooksPerStudent);
  const [gracePeriod, setGracePeriod] = useState(settings.gracePeriodDays);
  const [academicTerm, setAcademicTerm] = useState(settings.academicTerm);
  const [enableEmail, setEnableEmail] = useState(settings.enableEmailReminders);
  const [enable3Day, setEnable3Day] = useState(settings.enableDueReminders3DaysPrior);

  const [savedMessage, setSavedMessage] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({
      finePerDay: Number(finePerDay),
      defaultLoanPeriodDays: Number(loanPeriod),
      maxBooksPerStudent: Number(maxBooks),
      gracePeriodDays: Number(gracePeriod),
      currencySymbol: settings.currencySymbol,
      academicTerm,
      enableEmailReminders: enableEmail,
      enableDueReminders3DaysPrior: enable3Day,
    });

    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Library Rules & System Configuration
        </h2>
        <p className="text-xs text-slate-500">
          Configure lending policies, overdue fine parameters, reminder schedules, and database settings
        </p>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Library configuration saved successfully and applied to active circulation calculations.</span>
        </div>
      )}

      {/* Lending Rules Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Shield className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Circulation & Overdue Fine Policies
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Overdue Fine Rate ($/day)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">$</span>
              <input
                type="number"
                step="0.05"
                min="0"
                disabled={!isLibrarian}
                value={finePerDay}
                onChange={(e) => setFinePerDay(parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Default fine charged per overdue day per book
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Grace Period (Days)
            </label>
            <input
              type="number"
              min="0"
              max="7"
              disabled={!isLibrarian}
              value={gracePeriod}
              onChange={(e) => setGracePeriod(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white disabled:opacity-60"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Days allowed after due date before fines commence
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Standard Loan Duration (Days)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              disabled={!isLibrarian}
              value={loanPeriod}
              onChange={(e) => setLoanPeriod(parseInt(e.target.value) || 14)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white disabled:opacity-60"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Default checkout duration for undergraduate accounts
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Max Books Per Student
            </label>
            <input
              type="number"
              min="1"
              max="10"
              disabled={!isLibrarian}
              value={maxBooks}
              onChange={(e) => setMaxBooks(parseInt(e.target.value) || 4)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white disabled:opacity-60"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Concurrent borrowing limit per active membership
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Current Academic Term
          </label>
          <input
            type="text"
            disabled={!isLibrarian}
            value={academicTerm}
            onChange={(e) => setAcademicTerm(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white disabled:opacity-60"
          />
        </div>

        {/* Due Date Notifications */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-600" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Automated Reminders & Alerts
            </h4>
          </div>

          <label className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              disabled={!isLibrarian}
              checked={enable3Day}
              onChange={(e) => setEnable3Day(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>Dispatch advance return notification 3 days prior to due date</span>
          </label>

          <label className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              disabled={!isLibrarian}
              checked={enableEmail}
              onChange={(e) => setEnableEmail(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>Enable in-app overdue notification flags for students</span>
          </label>
        </div>

        {isLibrarian && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-colors"
            >
              Save Library Rules
            </button>
          </div>
        )}
      </form>

      {/* Database & Firebase Status */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Database & Persistence Architecture
          </h3>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Storage Engine:
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-teal-600 dark:text-teal-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full Persistent Demo Storage (Firestore Compatible)</span>
            </span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            All records (users, students, books, bookCopies, borrowTransactions, readingLists, readingProgress, notifications, librarySettings) are stored and persisted across sessions. Full Firestore security rules are provisioned in <code className="font-mono text-teal-600">firestore.rules</code>.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white block">
              Reset Demo Sandbox Data
            </span>
            <span className="text-[11px] text-slate-400">
              Restore initial library catalog, mock transactions, and sample students.
            </span>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Reset All Library Data?
            </h4>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              This will restore all book holdings, copy barcodes, transactions, and student accounts to their original demo state.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
