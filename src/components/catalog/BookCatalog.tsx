import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Grid,
  List,
  Globe,
  Loader2,
} from 'lucide-react';
import { Book, User } from '../../types';
import { searchGoogleBooks, GoogleBookItem } from '../../services/api';

interface BookCatalogProps {
  books: Book[];
  currentUser: User;
  onSelectBook: (bookId: string) => void;
  onSaveBook: (book: Partial<Book> & { title: string; author: string }) => void;
  onOpenSummarizer: (book: { title: string; author: string; description: string }) => void;
}

export const BookCatalog: React.FC<BookCatalogProps> = ({
  books,
  currentUser,
  onSelectBook,
  onSaveBook,
  onOpenSummarizer,
}) => {
  const isLibrarian = currentUser.role === 'librarian';

  const [activeTab, setActiveTab] = useState<'holdings' | 'google_books'>('holdings');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Google Books state
  const [googleQuery, setGoogleQuery] = useState('Computer Science');
  const [googleResults, setGoogleResults] = useState<GoogleBookItem[]>([]);
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Add Book Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newGenre, setNewGenre] = useState('Computer Science');
  const [newCategory, setNewCategory] = useState('Software Engineering');
  const [newDescription, setNewDescription] = useState('');
  const [newShelfLocation, setNewShelfLocation] = useState('Level 2, Stack 12A');
  const [newCopies, setNewCopies] = useState(3);
  const [newCoverUrl, setNewCoverUrl] = useState('');

  // Categories list derived from current books
  const categories = ['All', ...Array.from(new Set(books.map((b) => b.genre)))];

  // Filtered local books
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || book.genre === selectedCategory;

    const matchesStock = !inStockOnly || book.availableCopies > 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Fetch Google Books when tab opens or user searches
  const handleGoogleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!googleQuery.trim()) return;

    setIsSearchingGoogle(true);
    setGoogleError(null);
    try {
      const results = await searchGoogleBooks(googleQuery);
      setGoogleResults(results);
    } catch (err: any) {
      setGoogleError(err.message || 'Failed to search Google Books API');
    } finally {
      setIsSearchingGoogle(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'google_books' && googleResults.length === 0) {
      handleGoogleSearch();
    }
  }, [activeTab]);

  const handleImportGoogleBook = (gBook: GoogleBookItem) => {
    const info = gBook.volumeInfo;
    const isbn =
      info.industryIdentifiers?.find((id) => id.type.includes('13'))?.identifier ||
      info.industryIdentifiers?.[0]?.identifier ||
      `978${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    onSaveBook({
      title: info.title,
      author: info.authors ? info.authors.join(', ') : 'Unknown Author',
      isbn,
      publisher: info.publisher || 'University Press',
      publishedYear: info.publishedDate ? parseInt(info.publishedDate.slice(0, 4)) : new Date().getFullYear(),
      genre: info.categories?.[0] || 'Reference',
      category: info.categories?.[0] || 'General Reference',
      description: info.description || 'Imported via Google Books API search.',
      coverUrl: info.imageLinks?.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
      shelfLocation: 'Level 2, Stacks New Arrivals',
      totalCopies: 3,
    });

    setActiveTab('holdings');
  };

  const handleCreateBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) return;

    onSaveBook({
      title: newTitle.trim(),
      author: newAuthor.trim(),
      isbn: newIsbn.trim() || `978${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      genre: newGenre,
      category: newCategory,
      description: newDescription.trim() || 'College library holding.',
      shelfLocation: newShelfLocation,
      totalCopies: Number(newCopies),
      coverUrl: newCoverUrl.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    });

    setShowAddModal(false);
    // Reset form
    setNewTitle('');
    setNewAuthor('');
    setNewIsbn('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Library Catalog & Global Book Index
          </h2>
          <p className="text-xs text-slate-500">
            Search physical campus holdings or query the worldwide Google Books database
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isLibrarian && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Book to Catalog</span>
            </button>
          )}

          {/* Segmented Tab Controls */}
          <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('holdings')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'holdings'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Campus Holdings ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('google_books')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'google_books'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-teal-500" />
              <span>Google Books API</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Campus Holdings */}
      {activeTab === 'holdings' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, ISBN (e.g. 9780262033848), or keywords..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Filter by Category */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Subject:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="py-1.5 px-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* In-Stock Toggle */}
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Available Only</span>
              </label>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400'}`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400'}`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Empty state */}
          {filteredBooks.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                No matching campus books found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Try loosening your search filters or check the Google Books API tab to search public volumes.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setInStockOnly(false);
                }}
                className="mt-4 px-3.5 py-1.5 text-xs font-medium text-teal-600 bg-teal-50 dark:bg-teal-950/40 rounded-lg hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBooks.map((book) => {
                const isAvailable = book.availableCopies > 0;
                return (
                  <div
                    key={book.id}
                    className="flex flex-col rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-teal-500/50 hover:shadow-md transition-all group"
                  >
                    {/* Book Cover Area */}
                    <div
                      onClick={() => onSelectBook(book.id)}
                      className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
                    >
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900/80 backdrop-blur-xs text-white">
                        {book.shelfLocation}
                      </div>
                      <div className="absolute bottom-2 left-2">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{book.availableCopies} of {book.totalCopies} Available</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-600 text-white shadow-sm">
                            <AlertCircle className="w-3 h-3" />
                            <span>All Copies Checked Out</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Book Metadata */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mb-1">
                          {book.genre}
                        </div>
                        <h3
                          onClick={() => onSelectBook(book.id)}
                          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-teal-600 cursor-pointer"
                        >
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          by {book.author}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                          ISBN: {book.isbn} · {book.publishedYear}
                        </p>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onSelectBook(book.id)}
                          className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600"
                        >
                          Details & Copies
                        </button>
                        <button
                          onClick={() =>
                            onOpenSummarizer({
                              title: book.title,
                              author: book.author,
                              description: book.description,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 rounded hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors"
                          title="Generate AI Summary with Gemini"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>AI Summary</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-4 font-semibold">Title & Author</th>
                      <th className="py-2.5 px-4 font-semibold">Subject</th>
                      <th className="py-2.5 px-4 font-semibold">Shelf Location</th>
                      <th className="py-2.5 px-4 font-semibold">Available Copies</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <div
                            onClick={() => onSelectBook(book.id)}
                            className="font-bold text-slate-900 dark:text-white cursor-pointer hover:text-teal-600 truncate max-w-sm"
                          >
                            {book.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            by {book.author} · ISBN: {book.isbn}
                          </div>
                        </td>
                        <td className="py-3 px-4">{book.genre}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{book.shelfLocation}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-mono font-semibold ${
                              book.availableCopies > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600'
                            }`}
                          >
                            {book.availableCopies} / {book.totalCopies}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => onSelectBook(book.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-teal-600 hover:underline mr-2"
                          >
                            View Copies
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Google Books API Live Search */}
      {activeTab === 'google_books' && (
        <div className="space-y-4">
          <form
            onSubmit={handleGoogleSearch}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={googleQuery}
                onChange={(e) => setGoogleQuery(e.target.value)}
                placeholder="Query Google Books API (e.g. Operating Systems, Quantum Computing, ISBN)..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearchingGoogle}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSearchingGoogle ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching Google...</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>Search Google Books</span>
                </>
              )}
            </button>
          </form>

          {googleError && (
            <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 text-xs">
              {googleError}
            </div>
          )}

          {isSearchingGoogle ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
              <p className="text-xs text-slate-500 mt-2">Connecting to Google Books API...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {googleResults.map((item) => {
                const info = item.volumeInfo;
                const cover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div className="flex gap-3">
                      {cover ? (
                        <img
                          src={cover}
                          alt={info.title}
                          className="w-14 h-20 object-cover rounded shadow-xs border border-slate-200 dark:border-slate-700 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-20 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-400 shrink-0">
                          <BookOpen className="w-6 h-6" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold uppercase block truncate">
                          {info.categories?.[0] || 'Published Volume'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                          {info.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {info.authors ? info.authors.join(', ') : 'Unknown Author'}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">
                          {info.publishedDate} · {info.pageCount ? `${info.pageCount} pages` : ''}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mt-3 leading-relaxed">
                      {info.description || 'No volume description provided.'}
                    </p>

                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() =>
                          onOpenSummarizer({
                            title: info.title,
                            author: info.authors?.join(', ') || '',
                            description: info.description || '',
                          })
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI Summary</span>
                      </button>

                      {isLibrarian && (
                        <button
                          onClick={() => handleImportGoogleBook(item)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 rounded transition-colors"
                        >
                          + Add to Holdings
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Add New Book to College Holdings
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter catalog details and initial copy inventory count.
            </p>

            <form onSubmit={handleCreateBookSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Modern Operating Systems, 5th Edition"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Author(s) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Andrew S. Tanenbaum"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ISBN-13
                  </label>
                  <input
                    type="text"
                    value={newIsbn}
                    onChange={(e) => setNewIsbn(e.target.value)}
                    placeholder="9780133591620"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department / Genre
                  </label>
                  <select
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="System Design">System Design</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shelf Location
                  </label>
                  <input
                    type="text"
                    value={newShelfLocation}
                    onChange={(e) => setNewShelfLocation(e.target.value)}
                    placeholder="Level 2, Stack 14B"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Physical Copies Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newCopies}
                    onChange={(e) => setNewCopies(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cover Image URL (optional)
                  </label>
                  <input
                    type="url"
                    value={newCoverUrl}
                    onChange={(e) => setNewCoverUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Synopsis
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Academic syllabus overview..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm"
                >
                  Save and Generate Barcodes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
