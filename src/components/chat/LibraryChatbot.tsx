import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  BookOpen,
  Clock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Book, LibrarySettings, User } from '../../types';
import { askLibraryAssistant } from '../../services/api';

interface LibraryChatbotProps {
  currentUser: User;
  books: Book[];
  settings: LibrarySettings;
  onSelectBook: (bookId: string) => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export const LibraryChatbot: React.FC<LibraryChatbotProps> = ({
  currentUser,
  books,
  settings,
  onSelectBook,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Hello ${currentUser.name}! I am the SmartLib AI Assistant. I can look up current physical holdings, explain overdue fine policies ($${settings.finePerDay.toFixed(2)}/day), verify shelf locations, and suggest course reading. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Is "Introduction to Algorithms" currently available on shelf?',
    'What are the library operating hours and borrowing rules?',
    'How are overdue fines calculated if a book is late?',
    'Can you recommend foundational books for software architecture?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context
      const inventorySummary = books
        .map((b) => `"${b.title}" by ${b.author}: ${b.availableCopies}/${b.totalCopies} available at ${b.shelfLocation}`)
        .join('; ');

      const rulesSummary = `Fine per day: $${settings.finePerDay}. Loan duration: ${settings.defaultLoanPeriodDays} days. Max books: ${settings.maxBooksPerStudent}. Grace period: ${settings.gracePeriodDays} days.`;

      const response = await askLibraryAssistant({
        message: query,
        history: messages.map((m) => ({ role: m.role, text: m.text })),
        context: {
          inventory: inventorySummary,
          rules: rulesSummary,
          student: {
            name: currentUser.name,
            studentId: currentUser.studentId || 'N/A',
            borrowedCount: 2,
          },
        },
      });

      const botMsg: Message = {
        role: 'model',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'I apologize, but I encountered an error communicating with the library server. Standard library borrowing period is 14 days and fines are $0.50/day. Please feel free to ask another question.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>SmartLib AI Assistant</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                Grounded in Real Inventory
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Ask about book availability, shelf locations, circulation policies, and course suggestions
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-teal-600 text-white'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-teal-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`mt-1.5 text-[10px] font-mono text-right ${
                    isUser ? 'text-teal-100' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic pl-11">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
            <span>SmartLib AI is querying library holdings and rules...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
          Suggestions:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500 whitespace-nowrap transition-colors disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about book availability, shelf locations, or library rules..."
          className="flex-1 px-4 py-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-xs"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-3 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send Query</span>
        </button>
      </form>
    </div>
  );
};
