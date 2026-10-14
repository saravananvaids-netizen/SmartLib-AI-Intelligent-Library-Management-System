import React, { useState } from 'react';
import {
  BookmarkCheck,
  BookOpen,
  Plus,
  CheckCircle2,
  TrendingUp,
  Star,
  Edit3,
  Trash2,
  Calendar,
} from 'lucide-react';
import { ReadingGoal, ReadingListEntry, ReadingProgress, User } from '../../types';

interface PersonalReadingListProps {
  currentUser: User;
  readingList: ReadingListEntry[];
  readingProgress: ReadingProgress[];
  readingGoal: ReadingGoal;
  onUpdateProgress: (bookId: string, currentPage: number, totalPages?: number, notes?: string) => void;
  onSelectBook: (bookId: string) => void;
}

export const PersonalReadingList: React.FC<PersonalReadingListProps> = ({
  currentUser,
  readingList,
  readingProgress,
  readingGoal,
  onUpdateProgress,
  onSelectBook,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'reading' | 'want_to_read' | 'completed'>('reading');
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editPage, setEditPage] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  const userReadingList = readingList.filter((r) => r.userId === currentUser.id);
  const userProgress = readingProgress.filter((p) => p.userId === currentUser.id);

  const filteredList = userReadingList.filter((item) => {
    if (activeTab === 'all') return true;
    return item.status === activeTab;
  });

  const handleStartEditProgress = (bookId: string) => {
    const prog = userProgress.find((p) => p.bookId === bookId);
    setEditingBookId(bookId);
    setEditPage(prog ? prog.currentPage : 50);
    setEditNotes(prog?.notes || '');
  };

  const handleSaveProgress = (bookId: string, totalPages = 500) => {
    onUpdateProgress(bookId, Number(editPage), totalPages, editNotes);
    setEditingBookId(null);
  };

  const goalPercentage = Math.round(
    (readingGoal.completedBooks / Math.max(1, readingGoal.targetBooks)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Personal Reading Log & Academic Goal Tracker
        </h2>
        <p className="text-xs text-slate-500">
          Track semester reading pace, log page progress on reserved monographs, and fulfill annual learning goals
        </p>
      </div>

      {/* Goal Summary Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-teal-950 text-white border border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
            <TrendingUp className="w-4 h-4" />
            <span>Academic Reading Challenge {readingGoal.year}</span>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight">
            {readingGoal.completedBooks} of {readingGoal.targetBooks} Books Completed ({goalPercentage}%)
          </h3>
          <p className="text-xs text-slate-300">
            You have logged <strong className="font-mono text-white">{readingGoal.completedPages}</strong> total pages read across your course syllabi.
          </p>

          <div className="w-full bg-slate-800 rounded-full h-2.5 mt-3 max-w-md overflow-hidden">
            <div
              className="bg-teal-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, goalPercentage)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center sm:border-l sm:border-slate-800 sm:pl-6 shrink-0">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Queue</span>
            <span className="font-mono text-xl font-bold text-white">
              {userReadingList.filter((r) => r.status === 'want_to_read').length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Active Reads</span>
            <span className="font-mono text-xl font-bold text-teal-400">
              {userReadingList.filter((r) => r.status === 'reading').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('reading')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'reading'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Currently Reading ({userReadingList.filter((r) => r.status === 'reading').length})
          </button>
          <button
            onClick={() => setActiveTab('want_to_read')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'want_to_read'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Want to Read ({userReadingList.filter((r) => r.status === 'want_to_read').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Finished ({userReadingList.filter((r) => r.status === 'completed').length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All ({userReadingList.length})
          </button>
        </div>
      </div>

      {/* Reading List Items */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <BookmarkCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No books in this reading shelf
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Browse the campus catalog to bookmark textbooks or research monographs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => {
            const prog = userProgress.find((p) => p.bookId === item.bookId);
            const totalPages = prog?.totalPages || 450;
            const currentPage = prog?.currentPage || 0;
            const percentage = Math.round((currentPage / totalPages) * 100);
            const isEditing = editingBookId === item.bookId;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <img
                      src={item.coverUrl}
                      alt={item.bookTitle}
                      className="w-16 h-24 object-cover rounded-lg shadow-xs border border-slate-200 dark:border-slate-700 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                        {item.status.replace('_', ' ')}
                      </span>
                      <h4
                        onClick={() => onSelectBook(item.bookId)}
                        className="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-teal-600 cursor-pointer"
                      >
                        {item.bookTitle}
                      </h4>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.bookAuthor}
                      </p>
                      {item.notes && (
                        <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-2">
                          &ldquo;{item.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar & Updater */}
                  {item.status === 'reading' && (
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          Reading Progress
                        </span>
                        <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                          {currentPage} / {totalPages} pages ({percentage}%)
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden mb-3">
                        <div
                          className="bg-teal-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {isEditing ? (
                        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              Current Page:
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={totalPages}
                              value={editPage}
                              onChange={(e) => setEditPage(parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded"
                            />
                            <button
                              onClick={() => handleSaveProgress(item.bookId, totalPages)}
                              className="px-3 py-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingBookId(null)}
                              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEditProgress(item.bookId)}
                          className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Update Page Log</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Added {item.addedAt}</span>
                  {item.rating && (
                    <span className="font-semibold text-amber-500">
                      ★ {item.rating} / 5
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
