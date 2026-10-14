import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  UserCheck,
  UserX,
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  DollarSign,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Student } from '../../types';

interface StudentManagementProps {
  students: Student[];
  onSaveStudent: (student: Partial<Student> & { name: string; department: string; email: string }) => void;
  onToggleStatus: (studentId: string, newStatus: Student['membershipStatus']) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  onSaveStudent,
  onToggleStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [formName, setFormName] = useState('');
  const [formStudentId, setFormStudentId] = useState('');
  const [formDepartment, setFormDepartment] = useState('Computer Science');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formMaxBooks, setFormMaxBooks] = useState(4);
  const [formStatus, setFormStatus] = useState<Student['membershipStatus']>('active');

  const departments = ['All', ...Array.from(new Set(students.map((s) => s.department)))];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === 'All' || student.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || student.membershipStatus === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormName('');
    setFormStudentId(`CS-2026-${String(students.length + 1).padStart(3, '0')}`);
    setFormDepartment('Computer Science');
    setFormEmail('');
    setFormPhone('+1 (555) 000-0000');
    setFormMaxBooks(4);
    setFormStatus('active');
    setShowModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormName(student.name);
    setFormStudentId(student.studentId);
    setFormDepartment(student.department);
    setFormEmail(student.email);
    setFormPhone(student.phone);
    setFormMaxBooks(student.maxBooksAllowed);
    setFormStatus(student.membershipStatus);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    onSaveStudent({
      id: editingStudent ? editingStudent.id : undefined,
      name: formName.trim(),
      studentId: formStudentId.trim(),
      department: formDepartment,
      email: formEmail.trim(),
      phone: formPhone.trim(),
      maxBooksAllowed: Number(formMaxBooks),
      membershipStatus: formStatus,
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Student Membership Directory
          </h2>
          <p className="text-xs text-slate-500">
            Manage academic library cards, borrowing limits, department enrollment, and account statuses
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, roll number (e.g. CS-2024-042), department, or email..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="py-1.5 px-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
              <option value="graduated">Graduated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 font-semibold">Student Name & ID</th>
                <th className="py-3 px-4 font-semibold">Department</th>
                <th className="py-3 px-4 font-semibold">Contact</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Active Loans</th>
                <th className="py-3 px-4 font-semibold">Fines Due</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isActive = student.membershipStatus === 'active';
                  const isSuspended = student.membershipStatus === 'suspended';

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {student.avatarUrl ? (
                            <img
                              src={student.avatarUrl}
                              alt={student.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                              {student.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {student.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              {student.studentId}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium">
                        {student.department}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-slate-500 font-mono">
                        <div>{student.email}</div>
                        <div className="text-slate-400">{student.phone}</div>
                      </td>

                      <td className="py-3 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Suspended</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Graduated</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`font-semibold ${
                            student.activeLoansCount >= student.maxBooksAllowed
                              ? 'text-amber-600'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {student.activeLoansCount} / {student.maxBooksAllowed}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold">
                        <span className={student.totalFinesDue > 0 ? 'text-rose-600' : 'text-slate-400'}>
                          ${student.totalFinesDue.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors mr-1"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {isActive ? (
                          <button
                            onClick={() => onToggleStatus(student.id, 'suspended')}
                            className="px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                            title="Suspend account"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => onToggleStatus(student.id, 'active')}
                            className="px-2 py-1 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors"
                            title="Reactivate account"
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingStudent ? 'Edit Student Details' : 'Register New Student'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student ID Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    placeholder="CS-2024-042"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Biomedical Engineering">Biomedical Engineering</option>
                    <option value="Business Analytics">Business Analytics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    College Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="alex@student.college.edu"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Max Books Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formMaxBooks}
                    onChange={(e) => setFormMaxBooks(parseInt(e.target.value) || 4)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Membership Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="graduated">Graduated</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm"
                >
                  {editingStudent ? 'Update Student Record' : 'Create Student Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
