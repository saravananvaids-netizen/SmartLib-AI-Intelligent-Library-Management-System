export type UserRole = 'librarian' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  studentId?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type MembershipStatus = 'active' | 'suspended' | 'graduated';

export interface Student {
  id: string;
  studentId: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  membershipStatus: MembershipStatus;
  joinedDate: string;
  maxBooksAllowed: number;
  activeLoansCount: number;
  totalFinesDue: number;
  avatarUrl?: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  publishedYear: number;
  genre: string;
  category: string;
  description: string;
  coverUrl: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  tags: string[];
}

export type CopyCondition = 'pristine' | 'good' | 'fair' | 'damaged';
export type CopyStatus = 'available' | 'issued' | 'reserved' | 'maintenance';

export interface BookCopy {
  id: string;
  bookId: string;
  barcode: string; // e.g. "LIB-CS-101-C1"
  condition: CopyCondition;
  status: CopyStatus;
  location: string;
  addedDate: string;
}

export type TransactionStatus = 'borrowed' | 'returned' | 'overdue';

export interface BorrowTransaction {
  id: string;
  copyId: string;
  barcode: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover?: string;
  studentId: string; // Foreign key to student document id
  studentCode: string; // e.g. "CS-2024-042"
  studentName: string;
  studentEmail: string;
  issueDate: string; // ISO date string
  dueDate: string; // ISO date string
  returnDate?: string | null;
  status: TransactionStatus;
  fineAmount: number;
  finePaid: boolean;
  notes?: string;
  issuedBy: string; // Librarian name or system
}

export type ReadingStatus = 'want_to_read' | 'reading' | 'completed';

export interface ReadingListEntry {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverUrl: string;
  status: ReadingStatus;
  rating?: number;
  notes?: string;
  addedAt: string;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  totalPages: number;
  currentPage: number;
  percentage: number;
  lastUpdated: string;
  notes?: string;
}

export interface ReadingGoal {
  id: string;
  userId: string;
  year: number;
  targetBooks: number;
  completedBooks: number;
  targetPages: number;
  completedPages: number;
}

export interface LibrarySettings {
  finePerDay: number; // e.g. $0.50
  defaultLoanPeriodDays: number; // e.g. 14
  maxBooksPerStudent: number; // e.g. 4
  gracePeriodDays: number; // e.g. 1
  currencySymbol: string; // e.g. '$'
  academicTerm: string; // e.g. 'Fall 2026'
  enableEmailReminders: boolean;
  enableDueReminders3DaysPrior: boolean;
}

export type NotificationType = 'due_soon' | 'overdue' | 'system' | 'recommendation';

export interface LibraryNotification {
  id: string;
  userId: string; // can be 'all' or specific student id
  title: string;
  message: string;
  type: NotificationType;
  date: string;
  read: boolean;
  link?: string;
}

export type ActivePage =
  | 'overview'
  | 'catalog'
  | 'book_details'
  | 'students'
  | 'circulation'
  | 'overdue_fines'
  | 'qr_scanner'
  | 'ai_recommendations'
  | 'ai_summarizer'
  | 'analytics'
  | 'assistant'
  | 'reading_list'
  | 'settings';
