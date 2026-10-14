import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Users,
  Repeat,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { Book, BookCopy, BorrowTransaction, Student } from '../../types';

interface ReadingAnalyticsProps {
  books: Book[];
  copies: BookCopy[];
  students: Student[];
  transactions: BorrowTransaction[];
}

export const ReadingAnalytics: React.FC<ReadingAnalyticsProps> = ({
  books,
  copies,
  students,
  transactions,
}) => {
  // 1. Monthly Circulation Trend Data (Simulated + Live)
  const monthlyData = [
    { month: 'May', issued: 48, returned: 44 },
    { month: 'Jun', issued: 35, returned: 40 },
    { month: 'Jul', issued: 22, returned: 25 },
    { month: 'Aug', issued: 65, returned: 52 },
    { month: 'Sep', issued: 88, returned: 76 },
    { month: 'Oct', issued: 95, returned: 84 },
  ];

  // 2. Category Distribution
  const categoryCountMap: Record<string, number> = {};
  books.forEach((b) => {
    categoryCountMap[b.genre] = (categoryCountMap[b.genre] || 0) + 1;
  });

  const categoryColors = ['#0D9488', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981'];
  const categoryData = Object.entries(categoryCountMap).map(([name, value], i) => ({
    name,
    value,
    color: categoryColors[i % categoryColors.length],
  }));

  // 3. Department Activity
  const deptCountMap: Record<string, number> = {
    'Computer Science': 14,
    'Data Science & AI': 10,
    'Electrical Eng': 7,
    'Mechanical Eng': 5,
    'Biomedical Eng': 4,
    'Business Analytics': 6,
  };

  const departmentData = Object.entries(deptCountMap).map(([dept, count]) => ({
    dept: dept.replace('Engineering', 'Eng'),
    borrowed: count,
  }));

  // 4. Copy Condition Breakdown
  const conditionCountMap: Record<string, number> = {
    Pristine: copies.filter((c) => c.condition === 'pristine').length,
    Good: copies.filter((c) => c.condition === 'good').length,
    Fair: copies.filter((c) => c.condition === 'fair').length,
    Damaged: copies.filter((c) => c.condition === 'damaged').length,
  };

  const conditionData = Object.entries(conditionCountMap).map(([cond, count]) => ({
    condition: cond,
    copies: count,
  }));

  // 5. Popular Books
  const popularBooks = [
    { title: 'Introduction to Algorithms (CLRS)', author: 'Cormen et al.', loans: 18, rating: '4.9' },
    { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', loans: 15, rating: '4.95' },
    { title: 'Clean Code', author: 'Robert C. Martin', loans: 14, rating: '4.8' },
    { title: 'Artificial Intelligence: A Modern Approach', author: 'Russell & Norvig', loans: 12, rating: '4.85' },
    { title: 'Modern Operating Systems', author: 'Andrew S. Tanenbaum', loans: 9, rating: '4.75' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Reading Analytics & Circulation Intelligence
        </h2>
        <p className="text-xs text-slate-500">
          Comprehensive university metrics on borrowing velocities, department engagement, and collection lifecycle
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Circulation Volume</span>
            <Repeat className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            353
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">
            +18.4% vs previous semester
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Active Library Patrons</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {students.length}
          </p>
          <span className="text-[11px] text-slate-400">
            92% active borrowing rate
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Catalog Utilization</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            78.5%
          </p>
          <span className="text-[11px] text-slate-400">
            Titles with active semester loans
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Average Loan Turnaround</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            11.2 <span className="text-xs font-normal text-slate-400">days</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">
            94% returned within due date
          </span>
        </div>
      </div>

      {/* Row 1: Circulation Trends + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Area Chart (8 Cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Circulation Velocity (Issued vs Returned)
              </h3>
              <p className="text-xs text-slate-500">
                Tracking circulation demand throughout the academic term
              </p>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="issued" name="Books Issued" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#colorIssued)" />
                <Area type="monotone" dataKey="returned" name="Books Returned" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorReturned)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Holdings by Discipline
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              Physical titles distribution
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {categoryData.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600 dark:text-slate-400 truncate max-w-[140px]">{c.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{c.value} titles</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Department Activity + Inventory Condition + Popular Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Activity Bar Chart (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Departmental Borrowing Engagement
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Total loans recorded across college engineering and science divisions
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="dept" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="borrowed" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Borrowed Leaderboard (6 Cols) */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Semester Most Popular Academic Titles
              </h3>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Top requested physical monographs & textbooks
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {popularBooks.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono font-bold text-[11px] flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.author}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-teal-600 dark:text-teal-400 block">
                      {item.loans} loans
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ★ {item.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
