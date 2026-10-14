import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Clock,
  GraduationCap,
  CheckCircle2,
  BookOpen,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { Book } from '../../types';
import { getAiSummary, SummaryResult } from '../../services/api';

interface AiSummarizerViewProps {
  books: Book[];
  initialBook?: { title: string; author: string; description: string } | null;
}

export const AiSummarizerView: React.FC<AiSummarizerViewProps> = ({
  books,
  initialBook,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || '');
  const [customTitle, setCustomTitle] = useState(initialBook?.title || '');
  const [customAuthor, setCustomAuthor] = useState(initialBook?.author || '');
  const [customDescription, setCustomDescription] = useState(initialBook?.description || '');

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [result, setResult] = useState<SummaryResult>({
    fallback: false,
    summary:
      '"Introduction to Algorithms (CLRS)" serves as the definitive reference text for rigorous data structures and asymptotic complexity analysis. It establishes formal proof techniques alongside practical design paradigms including dynamic programming, divide-and-conquer, and greedy heuristics.',
    keyTakeaways: [
      'Mastery of asymptotic notation (Big-O, Big-Theta, Big-Omega) for algorithmic runtime guarantees.',
      'Comprehensive graph traversal, minimum spanning trees, and maximum network flow models.',
      'Theoretical foundations of NP-completeness and approximation strategies for hard problems.',
    ],
    targetAudience: 'Sophomore to Graduate CS, Software Engineering & Applied Math Students',
    readTimeEstimate: '12-16 hours per semester module',
  });

  const handleSelectPreload = (bookId: string) => {
    setSelectedBookId(bookId);
    const book = books.find((b) => b.id === bookId);
    if (book) {
      setCustomTitle(book.title);
      setCustomAuthor(book.author);
      setCustomDescription(book.description);
    }
  };

  const handleSummarize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customTitle.trim() && !customDescription.trim()) return;

    setIsLoading(true);
    try {
      const data = await getAiSummary({
        title: customTitle,
        author: customAuthor,
        description: customDescription,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    const text = `Title: ${customTitle}\n\nAI Summary:\n${result.summary}\n\nKey Takeaways:\n${result.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n\nAudience: ${result.targetAudience}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini Academic Synthesis Engine</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          AI Book Summarizer & Syllabus Digest
        </h2>
        <p className="text-xs text-slate-500">
          Transform dense book descriptions, research monographs, and syllabus bibliographies into structured college takeaways
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Select or Paste (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <form
            onSubmit={handleSummarize}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pre-load from Campus Catalog
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => handleSelectPreload(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — {b.author}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Clean Architecture"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Author(s)
              </label>
              <input
                type="text"
                value={customAuthor}
                onChange={(e) => setCustomAuthor(e.target.value)}
                placeholder="e.g. Robert C. Martin"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Book Synopsis or Syllabus Excerpt
              </label>
              <textarea
                rows={5}
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Paste publisher overview, course outline, or chapter excerpts..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate AI Book Summary</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: Structured Takeaways (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">
                    AI-Generated Summary
                  </span>
                  {result.fallback && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Offline Curated)
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCopyText}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>

              {/* Title & Author */}
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {customTitle || 'Selected Title'}
              </h3>
              {customAuthor && (
                <p className="text-xs text-slate-500 mb-3">by {customAuthor}</p>
              )}

              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Executive Academic Synopsis
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Key Takeaways */}
              <div className="space-y-2 mb-4">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Key Academic Takeaways:
                </span>
                <div className="space-y-2">
                  {result.keyTakeaways.map((takeaway, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100/60 dark:border-teal-900/30 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audience & Read Time Strip */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <GraduationCap className="w-4 h-4 text-teal-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Recommended For</span>
                    <span className="font-medium text-slate-900 dark:text-white truncate block">
                      {result.targetAudience}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Study Read Time</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white">
                      {result.readTimeEstimate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 text-center">
              Generated by SmartLib AI using Gemini text analysis. Verify citations in primary literature.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
