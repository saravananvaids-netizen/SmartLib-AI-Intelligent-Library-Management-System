import React from 'react';
import {
  BookOpen,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  BookmarkCheck,
  TrendingUp,
  MessageSquare,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import {
  BorrowTransaction,
  ReadingGoal,
  ReadingListEntry,
  ReadingProgress,
  ActivePage,
  User,
  LibrarySettings,
} from '../../types';

interface StudentDashboardProps {
  currentUser: User;
  transactions: BorrowTransaction[];
  readingList: ReadingListEntry[];
  readingProgress: ReadingProgress[];
  readingGoal: ReadingGoal;
  settings: LibrarySettings;
  setActivePage: (page: ActivePage) => void;
  onSelectBook: (bookId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  transactions,
  readingList,
  readingProgress,
  readingGoal,
  settings,
  setActivePage,
  onSelectBook,
}) => {
  const myLoans = transactions.filter(
    (t) => t.studentId === currentUser.id && t.status !== 'returned'
  );

  const myFines = transactions
    .filter((t) => t.studentId === currentUser.id && !t.finePaid && t.fineAmount > 0)
    .reduce((sum, t) => sum + t.fineAmount, 0);

  const goalPercentage = Math.round(
    (readingGoal.completedBooks / Math.max(1, readingGoal.targetBooks)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Student Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 text-white border border-slate-800">
        <div className="max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-medium mb-3 border border-teal-500/30">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Undergraduate Student Portal · {currentUser.department}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name}!
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            You currently hold <strong className="text-white font-mono">{myLoans.length}</strong> active library loans. Free borrowing renewal is available up to 2 times before due date.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActivePage('ai_recommendations')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get AI Course Recommendations</span>
            </button>
            <button
              onClick={() => setActivePage('catalog')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Search Campus Catalog</span>
            </button>
            <button
              onClick={() => setActivePage('assistant')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span>Ask Library Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Currently Borrowed</span>
            <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {myLoans.length} <span className="text-xs font-normal text-slate-400">/ {settings.maxBooksPerStudent} max</span>
          </p>
          <span className="text-[11px] text-slate-400">Active loans in hand</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Reading Goal ({readingGoal.year})</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {readingGoal.completedBooks} <span className="text-xs font-normal text-slate-400">/ {readingGoal.targetBooks} books</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">{goalPercentage}% completed</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Saved Reading List</span>
            <BookmarkCheck className="w-4 h-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {readingList.length}
          </p>
          <span className="text-[11px] text-slate-400">Titles queued for study</span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Outstanding Fines</span>
            <AlertCircle className={`w-4 h-4 ${myFines > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <p className={`mt-2 text-2xl font-bold font-mono ${myFines > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
            {settings.currencySymbol}{myFines.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400">
            {myFines === 0 ? 'Account in good standing' : 'Pay fine at circulation'}
          </span>
        </div>
      </div>

      {/* Main Student Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Active Loans (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                My Active Borrowed Books
              </h3>
              <p className="text-xs text-slate-500">
                Keep track of return dates to avoid overdue fines (${settings.finePerDay}/day)
              </p>
            </div>
            <button
              onClick={() => setActivePage('reading_list')}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
            >
              <span>Manage Progress</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myLoans.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                You have no books currently checked out.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Browse our catalog to borrow course textbooks or research monographs.
              </p>
              <button
                onClick={() => setActivePage('catalog')}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors"
              >
                Explore Catalog
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {myLoans.map((loan) => {
                const dueDate = new Date(loan.dueDate);
                const today = new Date();
                const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isOverdue = diffDays < 0;

                return (
                  <div key={loan.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-start gap-3.5 min-w-0">
                      {loan.bookCover ? (
                        <img
                          src={loan.bookCover}
                          alt={loan.bookTitle}
                          className="w-12 h-16 object-cover rounded shadow-sm border border-slate-200 dark:border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-400 shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4
                          onClick={() => onSelectBook(loan.bookId)}
                          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate hover:text-teal-600 cursor-pointer"
                        >
                          {loan.bookTitle}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {loan.bookAuthor}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-slate-400">
                          <span>Tag: {loan.barcode}</span>
                          <span>·</span>
                          <span>Issued: {new Date(loan.issueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end justify-between shrink-0 gap-2">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Due Date</span>
                        <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white">
                          {dueDate.toLocaleDateString()}
                        </span>
                      </div>
                      {isOverdue ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                          Overdue ({Math.abs(diffDays)}d) · Fine: {settings.currencySymbol}{loan.fineAmount.toFixed(2)}
                        </span>
                      ) : diffDays <= 3 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          Due in {diffDays} {diffDays === 1 ? 'day' : 'days'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                          {diffDays} days left
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Reading Goal & Progress Highlights */}
        <div className="space-y-6">
          {/* Annual Goal Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Academic Reading Goal
              </h3>
              <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-semibold">
                {goalPercentage}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Target for {readingGoal.year}: {readingGoal.targetBooks} textbooks & publications
            </p>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, goalPercentage)}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>{readingGoal.completedBooks} finished</span>
              <span>{readingGoal.targetBooks - readingGoal.completedBooks} remaining</span>
            </div>

            <button
              onClick={() => setActivePage('reading_list')}
              className="w-full mt-4 py-2 px-3 text-xs font-semibold text-center text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
            >
              Update Reading Log
            </button>
          </div>

          {/* Quick AI Advisor Tile */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>SmartLib Recommendation AI</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Curated for {currentUser.department}
            </h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Gemini analyzed your recent coursework in Algorithms & Systems to tailor research papers and books for your capstone.
            </p>
            <button
              onClick={() => setActivePage('ai_recommendations')}
              className="w-full py-2 px-3 text-xs font-semibold bg-teal-600 hover:bg-teal-500 rounded-lg text-white transition-colors"
            >
              View Recommended Reading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
