import { useState, useEffect } from 'react';
import {
  Book,
  BookCopy,
  Student,
  BorrowTransaction,
  ReadingListEntry,
  ReadingProgress,
  ReadingGoal,
  LibrarySettings,
  LibraryNotification,
  User,
  ActivePage,
} from '../types';
import {
  INITIAL_BOOKS,
  INITIAL_COPIES,
  INITIAL_STUDENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_READING_LIST,
  INITIAL_READING_PROGRESS,
  INITIAL_READING_GOAL,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_LIBRARIAN,
  INITIAL_STUDENT_USER,
} from './mockData';

const STORAGE_KEYS = {
  BOOKS: 'smartlib_books',
  COPIES: 'smartlib_copies',
  STUDENTS: 'smartlib_students',
  TRANSACTIONS: 'smartlib_transactions',
  READING_LIST: 'smartlib_reading_list',
  READING_PROGRESS: 'smartlib_reading_progress',
  READING_GOAL: 'smartlib_reading_goal',
  SETTINGS: 'smartlib_settings',
  NOTIFICATIONS: 'smartlib_notifications',
  CURRENT_USER: 'smartlib_current_user',
  DARK_MODE: 'smartlib_dark_mode',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// Calculate fine based on due date, return date, and library settings
export function computeFine(
  dueDateStr: string,
  returnDateStr: string | null | undefined,
  finePerDay: number,
  gracePeriodDays: number
): { overdueDays: number; fineAmount: number; isOverdue: boolean } {
  const due = new Date(dueDateStr).getTime();
  const end = returnDateStr ? new Date(returnDateStr).getTime() : Date.now();
  
  const diffMs = end - due;
  if (diffMs <= 0) {
    return { overdueDays: 0, fineAmount: 0, isOverdue: false };
  }

  const rawOverdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const billableDays = Math.max(0, rawOverdueDays - gracePeriodDays);
  const fineAmount = Number((billableDays * finePerDay).toFixed(2));

  return {
    overdueDays: rawOverdueDays,
    fineAmount,
    isOverdue: rawOverdueDays > 0,
  };
}

export function useLibraryStore() {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const loaded = loadStorage<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_LIBRARIAN);
    if (loaded && loaded.role === 'librarian') {
      return INITIAL_LIBRARIAN;
    }
    return loaded;
  });

  const [activePage, setActivePage] = useState<ActivePage>('overview');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const [books, setBooks] = useState<Book[]>(() =>
    loadStorage<Book[]>(STORAGE_KEYS.BOOKS, INITIAL_BOOKS)
  );

  const [copies, setCopies] = useState<BookCopy[]>(() =>
    loadStorage<BookCopy[]>(STORAGE_KEYS.COPIES, INITIAL_COPIES)
  );

  const [students, setStudents] = useState<Student[]>(() =>
    loadStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS)
  );

  const [transactions, setTransactions] = useState<BorrowTransaction[]>(() => {
    const loaded = loadStorage<BorrowTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    return loaded.map((t) =>
      t.issuedBy.includes('Sarah') ? { ...t, issuedBy: 'Namachivayam (Librarian)' } : t
    );
  });

  const [readingList, setReadingList] = useState<ReadingListEntry[]>(() =>
    loadStorage<ReadingListEntry[]>(STORAGE_KEYS.READING_LIST, INITIAL_READING_LIST)
  );

  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>(() =>
    loadStorage<ReadingProgress[]>(STORAGE_KEYS.READING_PROGRESS, INITIAL_READING_PROGRESS)
  );

  const [readingGoal, setReadingGoal] = useState<ReadingGoal>(() =>
    loadStorage<ReadingGoal>(STORAGE_KEYS.READING_GOAL, INITIAL_READING_GOAL)
  );

  const [settings, setSettings] = useState<LibrarySettings>(() =>
    loadStorage<LibrarySettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
  );

  const [notifications, setNotifications] = useState<LibraryNotification[]>(() =>
    loadStorage<LibraryNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS)
  );

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    loadStorage<boolean>(STORAGE_KEYS.DARK_MODE, false)
  );

  // Sync to localStorage
  useEffect(() => saveStorage(STORAGE_KEYS.BOOKS, books), [books]);
  useEffect(() => saveStorage(STORAGE_KEYS.COPIES, copies), [copies]);
  useEffect(() => saveStorage(STORAGE_KEYS.STUDENTS, students), [students]);
  useEffect(() => saveStorage(STORAGE_KEYS.TRANSACTIONS, transactions), [transactions]);
  useEffect(() => saveStorage(STORAGE_KEYS.READING_LIST, readingList), [readingList]);
  useEffect(() => saveStorage(STORAGE_KEYS.READING_PROGRESS, readingProgress), [readingProgress]);
  useEffect(() => saveStorage(STORAGE_KEYS.READING_GOAL, readingGoal), [readingGoal]);
  useEffect(() => saveStorage(STORAGE_KEYS.SETTINGS, settings), [settings]);
  useEffect(() => saveStorage(STORAGE_KEYS.NOTIFICATIONS, notifications), [notifications]);
  useEffect(() => saveStorage(STORAGE_KEYS.CURRENT_USER, currentUser), [currentUser]);
  useEffect(() => {
    saveStorage(STORAGE_KEYS.DARK_MODE, isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Recalculate live fines for active transactions
  useEffect(() => {
    let hasChanges = false;
    const updated = transactions.map((tx) => {
      if (tx.status === 'borrowed') {
        const { fineAmount, isOverdue } = computeFine(
          tx.dueDate,
          tx.returnDate,
          settings.finePerDay,
          settings.gracePeriodDays
        );
        if (isOverdue && tx.fineAmount !== fineAmount) {
          hasChanges = true;
          return {
            ...tx,
            status: 'overdue' as const,
            fineAmount,
          };
        }
      }
      return tx;
    });

    if (hasChanges) {
      setTransactions(updated);
    }
  }, [settings.finePerDay, settings.gracePeriodDays]);

  // Actions

  // 1. Switch User Role / Account
  const switchUser = (role: 'librarian' | 'student', studentUser?: Student) => {
    if (role === 'librarian') {
      setCurrentUser(INITIAL_LIBRARIAN);
      setActivePage('overview');
    } else {
      const targetStudent = studentUser || INITIAL_STUDENT_USER;
      setCurrentUser({
        id: targetStudent.id,
        studentId: targetStudent.studentId,
        name: targetStudent.name,
        email: targetStudent.email,
        role: 'student',
        department: targetStudent.department,
        avatarUrl: targetStudent.avatarUrl,
        createdAt: 'joinedDate' in targetStudent ? targetStudent.joinedDate : targetStudent.createdAt,
      });
      setActivePage('overview');
    }
  };

  // 2. Issue a book copy to a student
  const issueBook = (
    copyBarcode: string,
    studentIdOrCode: string,
    loanDays = settings.defaultLoanPeriodDays,
    notes = ''
  ): { success: boolean; message: string; transaction?: BorrowTransaction } => {
    // Find copy
    const copy = copies.find((c) => c.barcode.toUpperCase() === copyBarcode.toUpperCase().trim());
    if (!copy) {
      return { success: false, message: `No copy found with Barcode/Inventory ID "${copyBarcode}".` };
    }

    if (copy.status !== 'available') {
      return {
        success: false,
        message: `Copy ${copy.barcode} is currently ${copy.status.toUpperCase()} and cannot be issued.`,
      };
    }

    // Find student
    const student = students.find(
      (s) =>
        s.id === studentIdOrCode ||
        s.studentId.toUpperCase() === studentIdOrCode.toUpperCase().trim() ||
        s.email.toLowerCase() === studentIdOrCode.toLowerCase().trim()
    );

    if (!student) {
      return { success: false, message: `No student record found for "${studentIdOrCode}".` };
    }

    if (student.membershipStatus !== 'active') {
      return {
        success: false,
        message: `Student account is ${student.membershipStatus.toUpperCase()}. Please clear outstanding dues or reactivate membership first.`,
      };
    }

    if (student.activeLoansCount >= student.maxBooksAllowed) {
      return {
        success: false,
        message: `Borrowing limit exceeded: ${student.name} currently holds ${student.activeLoansCount} books (maximum allowed: ${student.maxBooksAllowed}).`,
      };
    }

    // Find Book
    const book = books.find((b) => b.id === copy.bookId);
    if (!book) {
      return { success: false, message: 'Parent book record not found in catalog.' };
    }

    // Dates
    const issueDate = new Date().toISOString();
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + loanDays);
    const dueDate = dueDateObj.toISOString();

    const newTx: BorrowTransaction = {
      id: `tx_${Date.now()}`,
      copyId: copy.id,
      barcode: copy.barcode,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCover: book.coverUrl,
      studentId: student.id,
      studentCode: student.studentId,
      studentName: student.name,
      studentEmail: student.email,
      issueDate,
      dueDate,
      returnDate: null,
      status: 'borrowed',
      fineAmount: 0.00,
      finePaid: false,
      issuedBy: currentUser.name,
      notes,
    };

    // Update state atomically
    setCopies((prev) =>
      prev.map((c) =>
        c.id === copy.id
          ? { ...c, status: 'issued', location: `Circulation (Issued to ${student.name})` }
          : c
      )
    );

    setBooks((prev) =>
      prev.map((b) =>
        b.id === book.id
          ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) }
          : b
      )
    );

    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id
          ? { ...s, activeLoansCount: s.activeLoansCount + 1 }
          : s
      )
    );

    setTransactions((prev) => [newTx, ...prev]);

    // Send in-app notification
    const newNotif: LibraryNotification = {
      id: `notif_${Date.now()}`,
      userId: student.id,
      title: 'Book Issued Successfully',
      message: `You borrowed "${book.title}". Please return by ${new Date(dueDate).toLocaleDateString()}.`,
      type: 'due_soon',
      date: issueDate,
      read: false,
      link: 'circulation',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return {
      success: true,
      message: `Successfully issued "${book.title}" [${copy.barcode}] to ${student.name}.`,
      transaction: newTx,
    };
  };

  // 3. Return a book copy
  const returnBook = (
    transactionId: string,
    conditionUpdate?: BookCopy['condition']
  ): { success: boolean; message: string; fineDue: number } => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) {
      return { success: false, message: 'Transaction not found.', fineDue: 0 };
    }

    if (tx.status === 'returned') {
      return { success: false, message: 'This book has already been returned.', fineDue: 0 };
    }

    const returnDate = new Date().toISOString();
    const { overdueDays, fineAmount } = computeFine(
      tx.dueDate,
      returnDate,
      settings.finePerDay,
      settings.gracePeriodDays
    );

    // Update copy
    setCopies((prev) =>
      prev.map((c) =>
        c.id === tx.copyId
          ? {
              ...c,
              status: conditionUpdate === 'damaged' ? 'maintenance' : 'available',
              condition: conditionUpdate || c.condition,
              location: 'Main Stacks / Shelving Cart',
            }
          : c
      )
    );

    // Update Book
    setBooks((prev) =>
      prev.map((b) =>
        b.id === tx.bookId
          ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) }
          : b
      )
    );

    // Update student active loans count and fine
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === tx.studentId) {
          return {
            ...s,
            activeLoansCount: Math.max(0, s.activeLoansCount - 1),
            totalFinesDue: Number((s.totalFinesDue + (fineAmount > 0 ? fineAmount : 0)).toFixed(2)),
          };
        }
        return s;
      })
    );

    // Update transaction
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === tx.id
          ? {
              ...t,
              returnDate,
              status: 'returned',
              fineAmount,
              finePaid: fineAmount === 0,
            }
          : t
      )
    );

    return {
      success: true,
      message: `Book "${tx.bookTitle}" returned successfully.${
        fineAmount > 0
          ? ` Overdue by ${overdueDays} days. Fine calculated: ${settings.currencySymbol}${fineAmount.toFixed(2)}.`
          : ' Returned within loan schedule with no fines.'
      }`,
      fineDue: fineAmount,
    };
  };

  // 4. Pay / Settle fine
  const settleFine = (transactionId: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx || tx.fineAmount <= 0) return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, finePaid: true } : t))
    );

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === tx.studentId) {
          const newFines = Math.max(0, Number((s.totalFinesDue - tx.fineAmount).toFixed(2)));
          return {
            ...s,
            totalFinesDue: newFines,
            // If was suspended and fines cleared, auto reactivate
            membershipStatus: s.membershipStatus === 'suspended' && newFines === 0 ? 'active' : s.membershipStatus,
          };
        }
        return s;
      })
    );
  };

  // 5. Add / Update Student
  const saveStudent = (studentData: Partial<Student> & { name: string; department: string; email: string }) => {
    if (studentData.id) {
      // Edit
      setStudents((prev) =>
        prev.map((s) => (s.id === studentData.id ? ({ ...s, ...studentData } as Student) : s))
      );
    } else {
      // Add
      const studentCount = students.length + 1;
      const deptCode = studentData.department.slice(0, 3).toUpperCase();
      const newStudent: Student = {
        id: `usr_stu_${Date.now()}`,
        studentId: studentData.studentId || `${deptCode}-2026-${String(studentCount).padStart(3, '0')}`,
        name: studentData.name,
        department: studentData.department,
        email: studentData.email,
        phone: studentData.phone || '+1 (555) 000-0000',
        membershipStatus: studentData.membershipStatus || 'active',
        joinedDate: new Date().toISOString().split('T')[0],
        maxBooksAllowed: studentData.maxBooksAllowed || settings.maxBooksPerStudent,
        activeLoansCount: 0,
        totalFinesDue: 0.00,
      };
      setStudents((prev) => [newStudent, ...prev]);
    }
  };

  // 6. Toggle Student Membership
  const toggleStudentStatus = (id: string, newStatus: Student['membershipStatus']) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, membershipStatus: newStatus } : s))
    );
  };

  // 7. Add / Update Book in Catalog
  const saveBook = (bookData: Partial<Book> & { title: string; author: string }) => {
    if (bookData.id) {
      setBooks((prev) =>
        prev.map((b) => (b.id === bookData.id ? ({ ...b, ...bookData } as Book) : b))
      );
    } else {
      const bookId = `bk_${Date.now()}`;
      const totalCopies = bookData.totalCopies || 2;
      const newBook: Book = {
        id: bookId,
        isbn: bookData.isbn || `978${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        title: bookData.title,
        author: bookData.author,
        publisher: bookData.publisher || 'University Academic Press',
        publishedYear: bookData.publishedYear || new Date().getFullYear(),
        genre: bookData.genre || 'Computer Science',
        category: bookData.category || 'General Reference',
        description: bookData.description || 'College library reference holding.',
        coverUrl: bookData.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
        shelfLocation: bookData.shelfLocation || 'Level 2, General Stacks',
        totalCopies,
        availableCopies: totalCopies,
        tags: bookData.tags || ['Catalog'],
      };

      // Also create physical inventory copies
      const newCopies: BookCopy[] = [];
      const prefix = newBook.genre.slice(0, 3).toUpperCase();
      for (let i = 1; i <= totalCopies; i++) {
        newCopies.push({
          id: `cp_${Date.now()}_${i}`,
          bookId,
          barcode: `LIB-${prefix}-${Date.now().toString().slice(-4)}-C${i}`,
          condition: 'pristine',
          status: 'available',
          location: newBook.shelfLocation,
          addedDate: new Date().toISOString().split('T')[0],
        });
      }

      setBooks((prev) => [newBook, ...prev]);
      setCopies((prev) => [...newCopies, ...prev]);
    }
  };

  // 8. Add / Update Book Copy
  const addCopy = (bookId: string, condition: BookCopy['condition'] = 'pristine', location = 'Level 2, Stacks') => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    const existingCount = copies.filter((c) => c.bookId === bookId).length + 1;
    const prefix = book.genre.slice(0, 3).toUpperCase();
    const newCopy: BookCopy = {
      id: `cp_${Date.now()}`,
      bookId,
      barcode: `LIB-${prefix}-${book.isbn.slice(-4)}-C${existingCount}`,
      condition,
      status: 'available',
      location,
      addedDate: new Date().toISOString().split('T')[0],
    };

    setCopies((prev) => [newCopy, ...prev]);
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? { ...b, totalCopies: b.totalCopies + 1, availableCopies: b.availableCopies + 1 }
          : b
      )
    );
  };

  // 9. Reading list and progress
  const addToReadingList = (book: Book, status: ReadingListEntry['status'] = 'want_to_read') => {
    const exists = readingList.find((r) => r.bookId === book.id && r.userId === currentUser.id);
    if (exists) {
      setReadingList((prev) =>
        prev.map((r) => (r.id === exists.id ? { ...r, status } : r))
      );
      return;
    }

    const newEntry: ReadingListEntry = {
      id: `rl_${Date.now()}`,
      userId: currentUser.id,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      coverUrl: book.coverUrl,
      status,
      addedAt: new Date().toISOString().split('T')[0],
    };
    setReadingList((prev) => [newEntry, ...prev]);
  };

  const updateReadingProgress = (bookId: string, currentPage: number, totalPages = 400, notes = '') => {
    const percentage = Math.min(100, Math.round((currentPage / totalPages) * 100));
    const existing = readingProgress.find((p) => p.bookId === bookId && p.userId === currentUser.id);

    if (existing) {
      setReadingProgress((prev) =>
        prev.map((p) =>
          p.id === existing.id
            ? { ...p, currentPage, totalPages, percentage, notes, lastUpdated: new Date().toISOString().split('T')[0] }
            : p
        )
      );
    } else {
      const book = books.find((b) => b.id === bookId);
      const newProg: ReadingProgress = {
        id: `prog_${Date.now()}`,
        userId: currentUser.id,
        bookId,
        bookTitle: book?.title || 'Unknown Title',
        totalPages,
        currentPage,
        percentage,
        notes,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      setReadingProgress((prev) => [newProg, ...prev]);
    }

    // Update goal completed pages
    setReadingGoal((prev) => ({
      ...prev,
      completedPages: Math.min(prev.targetPages, prev.completedPages + 15),
    }));
  };

  // 10. Reset data to factory demo
  const resetAllData = () => {
    localStorage.clear();
    setBooks(INITIAL_BOOKS);
    setCopies(INITIAL_COPIES);
    setStudents(INITIAL_STUDENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setReadingList(INITIAL_READING_LIST);
    setReadingProgress(INITIAL_READING_PROGRESS);
    setReadingGoal(INITIAL_READING_GOAL);
    setSettings(INITIAL_SETTINGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(INITIAL_LIBRARIAN);
    setIsDarkMode(false);
  };

  return {
    currentUser,
    switchUser,
    activePage,
    setActivePage,
    selectedBookId,
    setSelectedBookId,
    books,
    copies,
    students,
    transactions,
    readingList,
    readingProgress,
    readingGoal,
    settings,
    setSettings,
    notifications,
    setNotifications,
    isDarkMode,
    setIsDarkMode,
    issueBook,
    returnBook,
    settleFine,
    saveStudent,
    toggleStudentStatus,
    saveBook,
    addCopy,
    addToReadingList,
    updateReadingProgress,
    resetAllData,
  };
}
