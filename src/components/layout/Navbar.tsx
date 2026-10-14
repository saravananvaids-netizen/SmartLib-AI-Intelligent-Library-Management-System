import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { LibraryNotification, User } from '../../types';

interface NavbarProps {
  currentUser: User;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  notifications: LibraryNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<LibraryNotification[]>>;
  onOpenSearch: () => void;
  pageTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isDarkMode,
  setIsDarkMode,
  notifications,
  setNotifications,
  onOpenSearch,
  pageTitle,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = notifications.filter(
    (n) => !n.read && (n.userId === 'all' || n.userId === currentUser.id)
  ).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotifIcon = (type: LibraryNotification['type']) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'due_soon':
        return <Clock className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'recommendation':
        return <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Zone 1: Current Breadcrumb & Contextual Title */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider whitespace-nowrap">
          SmartLib AI
        </span>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Zone 2: Fast Global Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search books by title, author, or ISBN...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-500 dark:text-slate-300">
            Catalog
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions & Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 rounded">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications at this time.
                  </div>
                ) : (
                  notifications
                    .filter((n) => n.userId === 'all' || n.userId === currentUser.id)
                    .map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 flex gap-3 text-left transition-colors ${
                          notif.read
                            ? 'bg-transparent opacity-75'
                            : 'bg-teal-50/40 dark:bg-teal-950/20'
                        }`}
                      >
                        <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1 block">
                            {new Date(notif.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {currentUser.name}
            </span>
            <span className="block text-[11px] text-slate-400 dark:text-slate-500 leading-tight capitalize">
              {currentUser.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
