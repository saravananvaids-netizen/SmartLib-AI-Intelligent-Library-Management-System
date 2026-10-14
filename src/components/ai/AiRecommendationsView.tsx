import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  BookmarkCheck,
  RefreshCw,
  Search,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import { Book, User } from '../../types';
import { getAiRecommendations, RecommendationResult } from '../../services/api';

interface AiRecommendationsViewProps {
  currentUser: User;
  books: Book[];
  onAddToReadingList: (book: Book) => void;
  onSearchInCatalog: (title: string) => void;
}

export const AiRecommendationsView: React.FC<AiRecommendationsViewProps> = ({
  currentUser,
  books,
  onAddToReadingList,
  onSearchInCatalog,
}) => {
  const [department, setDepartment] = useState(currentUser.department || 'Computer Science');
  const [interests, setInterests] = useState('Distributed systems, algorithms, database scalability, machine learning');
  const [favoriteSubjects, setFavoriteSubjects] = useState('Software Engineering, Computer Architecture');
  const [currentBooks, setCurrentBooks] = useState('Introduction to Algorithms, Clean Code');

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([
    {
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      subject: 'Distributed Systems & Architecture',
      isbn: '9781449373320',
      reason: `Directly complements your studies in ${currentUser.department || 'Computer Science'} by explaining how modern cloud databases balance consistency and partitioning.`,
      keyInsight: 'Storage engines, replication topologies, and consensus protocols form the backbone of reliable software.',
    },
    {
      title: 'Algorithms to Live By: The Computer Science of Human Decisions',
      author: 'Brian Christian and Tom Griffiths',
      subject: 'Applied Algorithmic Theory',
      isbn: '9781627790369',
      reason: 'Bridges theoretical algorithmic complexity with practical decision-making and cognitive paradigms.',
      keyInsight: 'Optimal stopping theory (the 37% rule) and caching hierarchies apply equally to computer memory and human tasks.',
    },
    {
      title: 'Deep Learning',
      author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
      subject: 'Neural Networks & AI',
      isbn: '9780262035613',
      reason: 'Essential mathematical grounding in linear algebra and gradient descent for college research in intelligent systems.',
      keyInsight: 'Backpropagation through multi-layer architectures unlocks universal function approximation.',
    },
    {
      title: 'The Pragmatic Programmer: 20th Anniversary Edition',
      author: 'David Thomas and Andrew Hunt',
      subject: 'Software Craftsmanship',
      isbn: '9780135957059',
      reason: 'Crucial reading before your senior capstone project and industry software internships.',
      keyInsight: 'Emphasize orthogonality, automated testing, and ruthless elimination of duplication (DRY).',
    },
  ]);
  const [isFallback, setIsFallback] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const res = await getAiRecommendations({
        department,
        interests,
        favoriteSubjects,
        currentBooks,
      });
      setRecommendations(res.recommendations);
      setIsFallback(res.fallback);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Powered by Gemini AI</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Intelligent Academic Book Recommendations
        </h2>
        <p className="text-xs text-slate-500">
          Tailored reading recommendations matching your degree curriculum, research interests, and course objectives
        </p>
      </div>

      {/* Profile Parameters Form */}
      <form
        onSubmit={handleGenerate}
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Academic Department / Major
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science, Electrical Engineering..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Favorite Subjects & Specializations
            </label>
            <input
              type="text"
              value={favoriteSubjects}
              onChange={(e) => setFavoriteSubjects(e.target.value)}
              placeholder="e.g. Operating Systems, Cryptography, Robotics..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Research & Reading Interests
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Microservices, AI prompt engineering, quantum computing..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Recently Read or Borrowed Books
            </label>
            <input
              type="text"
              value={currentBooks}
              onChange={(e) => setCurrentBooks(e.target.value)}
              placeholder="e.g. Introduction to Algorithms, Clean Code..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400">
            {isFallback ? 'Showing curated college library sample recommendations.' : 'Recommendations dynamically synthesized with Gemini.'}
          </span>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Academic Reading Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Recommendations</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, idx) => {
          // Check if this book exists in local campus holdings
          const matchingHolding = books.find(
            (b) =>
              b.title.toLowerCase().includes(rec.title.toLowerCase()) ||
              b.isbn === rec.isbn
          );

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                    {rec.subject}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ISBN: {rec.isbn}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {rec.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  by {rec.author}
                </p>

                {/* AI Reasoning Pill */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                    <span>Curricular Alignment</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                    {rec.reason}
                  </p>
                </div>

                {/* Key Insight */}
                <div className="mt-2.5 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    <strong>Core Takeaway:</strong> {rec.keyInsight}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {matchingHolding ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Campus Holdings ({matchingHolding.availableCopies} available)</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Available via Interlibrary Loan
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSearchInCatalog(rec.title)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600"
                  >
                    <Search className="w-3 h-3" />
                    <span>Locate</span>
                  </button>

                  <button
                    onClick={() =>
                      onAddToReadingList({
                        id: `rec_${Date.now()}_${idx}`,
                        title: rec.title,
                        author: rec.author,
                        isbn: rec.isbn,
                        genre: rec.subject,
                        category: rec.subject,
                        publisher: 'Academic Press',
                        publishedYear: 2023,
                        description: rec.reason,
                        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
                        shelfLocation: 'Stack Reference',
                        totalCopies: 1,
                        availableCopies: 1,
                        tags: ['AI Recommendation'],
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded transition-colors"
                  >
                    <BookmarkCheck className="w-3 h-3" />
                    <span>Save to List</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
