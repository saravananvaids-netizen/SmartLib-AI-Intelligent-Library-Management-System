import React, { useState } from 'react';
import {
  BookOpen,
  LayoutDashboard,
  Library,
  Users,
  Repeat,
  AlertCircle,
  QrCode,
  Sparkles,
  FileText,
  BarChart3,
  MessageSquare,
  BookmarkCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  ArrowRightLeft,
} from 'lucide-react';
import { ActivePage, User } from '../../types';

interface SidebarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentUser: User;
  switchUser: (role: 'librarian' | 'student') => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  overdueCount: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  currentUser,
  switchUser,
  isCollapsed,
  setIsCollapsed,
  overdueCount,
}) => {
  const isLibrarian = currentUser.role === 'librarian';

  const librarianNav: NavItem[] = [
    { id: 'overview', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'catalog', label: 'Book Catalog & Search', icon: Library },
    { id: 'circulation', label: 'Issue & Return', icon: Repeat },
    { id: 'overdue_fines', label: 'Overdue & Fines', icon: AlertCircle, badge: overdueCount > 0 ? overdueCount : undefined },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'qr_scanner', label: 'QR Scanner & Barcodes', icon: QrCode },
    { id: 'ai_recommendations', label: 'AI Recommendations', icon: Sparkles },
    { id: 'ai_summarizer', label: 'AI Summarizer', icon: FileText },
    { id: 'analytics', label: 'Reading Analytics', icon: BarChart3 },
    { id: 'assistant', label: 'Smart Assistant', icon: MessageSquare },
    { id: 'settings', label: 'Rules & Settings', icon: Settings },
  ];

  const studentNav: NavItem[] = [
    { id: 'overview', label: 'Student Dashboard', icon: LayoutDashboard },
    { id: 'catalog', label: 'Browse Catalog', icon: Library },
    { id: 'reading_list', label: 'My Reading Progress', icon: BookmarkCheck },
    { id: 'ai_recommendations', label: 'AI Book Recommendations', icon: Sparkles },
    { id: 'ai_summarizer', label: 'AI Book Summaries', icon: FileText },
    { id: 'assistant', label: 'Library Chatbot', icon: MessageSquare },
    { id: 'qr_scanner', label: 'Scan Book QR', icon: QrCode },
    { id: 'settings', label: 'Preferences & Rules', icon: Settings },
  ];

  const currentNav = isLibrarian ? librarianNav : studentNav;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-600 text-white shrink-0 shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                SmartLib <span className="text-teal-400">AI</span>
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                University Library
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className={`px-2 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '•••' : isLibrarian ? 'Library Administration' : 'Student Portal'}
        </div>

        {currentNav.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as ActivePage)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}
              {!isCollapsed && item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-xs font-mono font-semibold bg-rose-500 text-white rounded">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role Switcher & User Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        {!isCollapsed && (
          <div className="mb-3 px-2 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Test Role Switcher</span>
            <button
              onClick={() => switchUser(isLibrarian ? 'student' : 'librarian')}
              className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Switch to {isLibrarian ? 'Student' : 'Librarian'}</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="relative">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-700"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-teal-800 flex items-center justify-center text-white font-semibold text-xs">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                isLibrarian ? 'bg-amber-400' : 'bg-teal-400'
              }`}
            />
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white truncate">{currentUser.name}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                {isLibrarian ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Librarian</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3 h-3 text-teal-400 shrink-0" />
                    <span>{currentUser.studentId}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
