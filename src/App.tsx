import React, { useState } from 'react';
import { useLibraryStore } from './services/store';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { LibrarianDashboard } from './components/dashboard/LibrarianDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { BookCatalog } from './components/catalog/BookCatalog';
import { BookDetailsModal } from './components/catalog/BookDetailsModal';
import { StudentManagement } from './components/students/StudentManagement';
import { CirculationManager } from './components/circulation/CirculationManager';
import { OverdueFines } from './components/fines/OverdueFines';
import { QrScannerModal } from './components/qr/QrScannerModal';
import { AiRecommendationsView } from './components/ai/AiRecommendationsView';
import { AiSummarizerView } from './components/ai/AiSummarizerView';
import { ReadingAnalytics } from './components/analytics/ReadingAnalytics';
import { LibraryChatbot } from './components/chat/LibraryChatbot';
import { PersonalReadingList } from './components/reading/PersonalReadingList';
import { SettingsView } from './components/settings/SettingsView';
import { ActivePage, Book } from './types';

export default function App() {
  const store = useLibraryStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modal / Detail state
  const [selectedBookModal, setSelectedBookModal] = useState<Book | null>(null);
  const [prefilledIssueBarcode, setPrefilledIssueBarcode] = useState<string | null>(null);
  const [summarizerTargetBook, setSummarizerTargetBook] = useState<{
    title: string;
    author: string;
    description: string;
  } | null>(null);

  const isLibrarian = store.currentUser.role === 'librarian';

  // Overdue count for badge
  const overdueCount = store.transactions.filter((t) => t.status === 'overdue').length;

  const handleSelectBook = (bookId: string) => {
    const book = store.books.find((b) => b.id === bookId);
    if (book) setSelectedBookModal(book);
  };

  const handleOpenSummarizer = (bookData: { title: string; author: string; description: string }) => {
    setSummarizerTargetBook(bookData);
    store.setActivePage('ai_summarizer');
  };

  const handleNavigateToIssueWithBarcode = (barcode: string) => {
    setPrefilledIssueBarcode(barcode);
    store.setActivePage('circulation');
  };

  const handleNavigateToReturnWithBarcode = (barcode: string) => {
    setPrefilledIssueBarcode(barcode);
    store.setActivePage('circulation');
  };

  const handleSendOverdueReminder = (studentId: string, bookTitle: string, dueDate: string) => {
    const newNotif = {
      id: `notif_${Date.now()}`,
      userId: studentId,
      title: 'Overdue Book Return Notice',
      message: `Your loan for "${bookTitle}" was due on ${new Date(dueDate).toLocaleDateString()}. Please return it to the circulation desk to halt further fine accrual.`,
      type: 'overdue' as const,
      date: new Date().toISOString(),
      read: false,
      link: 'circulation',
    };
    store.setNotifications((prev) => [newNotif, ...prev]);
  };

  const getPageTitle = (page: ActivePage): string => {
    switch (page) {
      case 'overview':
        return isLibrarian ? 'Administration Overview' : 'Student Portal Dashboard';
      case 'catalog':
        return 'Campus Catalog & Global Search';
      case 'circulation':
        return 'Circulation Desk · Issue & Return';
      case 'overdue_fines':
        return 'Overdue Loans & Fine Calculator';
      case 'students':
        return 'Student Membership Directory';
      case 'qr_scanner':
        return 'QR Code & Barcode Terminal';
      case 'ai_recommendations':
        return 'AI Book Recommendations';
      case 'ai_summarizer':
        return 'AI Book Summarizer';
      case 'analytics':
        return 'Reading Analytics & Circulation Intelligence';
      case 'assistant':
        return 'Smart Library Virtual Assistant';
      case 'reading_list':
        return 'My Reading Progress & Challenge';
      case 'settings':
        return 'Library Rules & System Settings';
      default:
        return 'SmartLib AI';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={store.activePage}
        setActivePage={store.setActivePage}
        currentUser={store.currentUser}
        switchUser={store.switchUser}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        overdueCount={overdueCount}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          currentUser={store.currentUser}
          isDarkMode={store.isDarkMode}
          setIsDarkMode={store.setIsDarkMode}
          notifications={store.notifications}
          setNotifications={store.setNotifications}
          onOpenSearch={() => store.setActivePage('catalog')}
          pageTitle={getPageTitle(store.activePage)}
        />

        {/* View Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {store.activePage === 'overview' &&
            (isLibrarian ? (
              <LibrarianDashboard
                books={store.books}
                copies={store.copies}
                students={store.students}
                transactions={store.transactions}
                settings={store.settings}
                setActivePage={store.setActivePage}
                onSelectBook={handleSelectBook}
                onReturnBook={(txId) => store.returnBook(txId)}
                onSettleFine={(txId) => store.settleFine(txId)}
              />
            ) : (
              <StudentDashboard
                currentUser={store.currentUser}
                transactions={store.transactions}
                readingList={store.readingList}
                readingProgress={store.readingProgress}
                readingGoal={store.readingGoal}
                settings={store.settings}
                setActivePage={store.setActivePage}
                onSelectBook={handleSelectBook}
              />
            ))}

          {store.activePage === 'catalog' && (
            <BookCatalog
              books={store.books}
              currentUser={store.currentUser}
              onSelectBook={handleSelectBook}
              onSaveBook={store.saveBook}
              onOpenSummarizer={handleOpenSummarizer}
            />
          )}

          {store.activePage === 'circulation' && (
            <CirculationManager
              books={store.books}
              copies={store.copies}
              students={store.students}
              transactions={store.transactions}
              settings={store.settings}
              onIssueBook={store.issueBook}
              onReturnBook={store.returnBook}
              onSettleFine={store.settleFine}
              prefilledBarcode={prefilledIssueBarcode}
            />
          )}

          {store.activePage === 'overdue_fines' && (
            <OverdueFines
              transactions={store.transactions}
              students={store.students}
              settings={store.settings}
              onSettleFine={store.settleFine}
              onSendReminder={handleSendOverdueReminder}
            />
          )}

          {store.activePage === 'students' && (
            <StudentManagement
              students={store.students}
              onSaveStudent={store.saveStudent}
              onToggleStatus={store.toggleStudentStatus}
            />
          )}

          {store.activePage === 'qr_scanner' && (
            <QrScannerModal
              books={store.books}
              copies={store.copies}
              transactions={store.transactions}
              onNavigateToIssue={handleNavigateToIssueWithBarcode}
              onNavigateToReturn={handleNavigateToReturnWithBarcode}
              onSelectBook={handleSelectBook}
            />
          )}

          {store.activePage === 'ai_recommendations' && (
            <AiRecommendationsView
              currentUser={store.currentUser}
              books={store.books}
              onAddToReadingList={store.addToReadingList}
              onSearchInCatalog={(title) => {
                store.setActivePage('catalog');
              }}
            />
          )}

          {store.activePage === 'ai_summarizer' && (
            <AiSummarizerView
              books={store.books}
              initialBook={summarizerTargetBook}
            />
          )}

          {store.activePage === 'analytics' && (
            <ReadingAnalytics
              books={store.books}
              copies={store.copies}
              students={store.students}
              transactions={store.transactions}
            />
          )}

          {store.activePage === 'assistant' && (
            <LibraryChatbot
              currentUser={store.currentUser}
              books={store.books}
              settings={store.settings}
              onSelectBook={handleSelectBook}
            />
          )}

          {store.activePage === 'reading_list' && (
            <PersonalReadingList
              currentUser={store.currentUser}
              readingList={store.readingList}
              readingProgress={store.readingProgress}
              readingGoal={store.readingGoal}
              onUpdateProgress={store.updateReadingProgress}
              onSelectBook={handleSelectBook}
            />
          )}

          {store.activePage === 'settings' && (
            <SettingsView
              settings={store.settings}
              setSettings={store.setSettings}
              currentUser={store.currentUser}
              onResetAllData={store.resetAllData}
            />
          )}
        </main>
      </div>

      {/* Book Details Modal */}
      {selectedBookModal && (
        <BookDetailsModal
          book={selectedBookModal}
          copies={store.copies}
          currentUser={store.currentUser}
          onClose={() => setSelectedBookModal(null)}
          onIssueCopy={handleNavigateToIssueWithBarcode}
          onAddCopy={(bookId) => store.addCopy(bookId)}
          onAddToReadingList={(book) => store.addToReadingList(book)}
          onOpenSummarizer={(bookData) => {
            setSelectedBookModal(null);
            handleOpenSummarizer(bookData);
          }}
        />
      )}
    </div>
  );
}
