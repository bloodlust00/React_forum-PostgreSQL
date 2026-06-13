import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, Search, Inbox, GraduationCap } from 'lucide-react';

export default function StudentGrid({
  students = [],
  total = 0,
  filters = {},
  setFilters,
  isLoading,
  onEdit,
  onDelete
}) {
  const { search = '', qualification = '', sortBy = 'created_at', sortOrder = 'desc', page = 1, limit = 5 } = filters;

  const totalPages = Math.ceil(total / limit) || 1;

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleQualificationFilter = (qual) => {
    setFilters(prev => ({ ...prev, qualification: qual, page: 1 }));
  };

  const handleSort = (field) => {
    setFilters(prev => {
      const isSameField = prev.sortBy === field;
      const order = isSameField && prev.sortOrder === 'asc' ? 'desc' : 'asc';
      return { ...prev, sortBy: field, sortOrder: order, page: 1 };
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Avatar backgrounds based on name (high contrast, light-suited solid colors)
  const getAvatarBg = (name) => {
    const colors = [
      'bg-slate-100 text-slate-700 border-slate-200',
      'bg-slate-200/50 text-slate-800 border-slate-250',
      'bg-blue-50 text-blue-700 border-blue-100',
      'bg-indigo-50 text-indigo-700 border-indigo-100',
      'bg-emerald-50 text-emerald-700 border-emerald-100',
      'bg-amber-50 text-amber-700 border-amber-100'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Badge colors for qualification stream (clean light badges)
  const getQualBadgeClass = (qual) => {
    const map = {
      'B.Tech': 'bg-indigo-50 text-indigo-700 border-indigo-100',
      'M.Tech': 'bg-violet-50 text-violet-700 border-violet-100',
      'BCA': 'bg-sky-50 text-sky-700 border-sky-100',
      'MCA': 'bg-emerald-50 text-emerald-700 border-emerald-100',
      'B.Sc': 'bg-cyan-50 text-cyan-700 border-cyan-100',
      'M.Sc': 'bg-pink-50 text-pink-700 border-pink-100',
      'MBA': 'bg-amber-50 text-amber-700 border-amber-100'
    };
    return map[qual] || 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const renderSkeletons = () => (
    <tbody>
      {Array.from({ length: limit }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          <td className="p-4"><div className="h-4 w-1/3 rounded-sm animate-shimmer" /></td>
          <td className="p-4"><div className="h-4 w-1/4 rounded-sm animate-shimmer" /></td>
          <td className="p-4"><div className="h-4 w-20 rounded-sm animate-shimmer" /></td>
          <td className="p-4"><div className="h-4 w-24 rounded-sm animate-shimmer" /></td>
          <td className="p-4 text-right"><div className="h-4 w-12 rounded-sm ml-auto animate-shimmer" /></td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className="space-y-4">
      {/* Search and Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-2 border-b border-slate-150">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus-glow text-sm"
          />
        </div>

        <select
          value={qualification}
          onChange={(e) => handleQualificationFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus-glow text-sm cursor-pointer"
        >
          <option value="">All Streams</option>
          <option value="B.Tech">B.Tech</option>
          <option value="M.Tech">M.Tech</option>
          <option value="BCA">BCA</option>
          <option value="MCA">MCA</option>
          <option value="B.Sc">B.Sc</option>
          <option value="M.Sc">M.Sc</option>
          <option value="MBA">MBA</option>
        </select>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-250 bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider select-none">
              <th className="p-4 w-[35%]">
                <button onClick={() => handleSort('first_name')} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                  Student Name <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="p-4 w-[20%]">
                <button onClick={() => handleSort('dob')} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                  Birth Date <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="p-4 w-[20%]">
                <button onClick={() => handleSort('qualification')} className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
                  Qualification <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </th>
              <th className="p-4 w-[15%]">Languages</th>
              <th className="p-4 w-[10%] text-right">Actions</th>
            </tr>
          </thead>

          {isLoading ? (
            renderSkeletons()
          ) : students.length > 0 ? (
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              <AnimatePresence initial={false}>
                {students.map((student) => {
                  const fullName = `${student.first_name} ${student.middle_name ? student.middle_name + ' ' : ''}${student.last_name}`;
                  return (
                    <motion.tr
                      key={student.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="hover:bg-slate-50/50 transition-all duration-150 group"
                    >
                      {/* Name & Initials */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs flex-shrink-0 ${getAvatarBg(fullName)}`}>
                            {getInitials(student.first_name, student.last_name)}
                          </div>
                          <div className="truncate">
                            <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                              {fullName}
                            </h3>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Joined {formatDate(student.created_at)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* DOB */}
                      <td className="p-4 font-medium text-slate-650">
                        {formatDate(student.dob)}
                      </td>

                      {/* Qualification Stream Badge */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${getQualBadgeClass(student.qualification)}`}>
                          <GraduationCap className="w-3.5 h-3.5" />
                          {student.qualification}
                        </span>
                      </td>

                      {/* Languages */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {student.languages_known.length > 0 ? (
                            student.languages_known.map(lang => (
                              <span
                                key={lang}
                                className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-500 border border-slate-200/50"
                              >
                                {lang}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">None</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(student)}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(student.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-700">No students recorded</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Adjust filters or add a student to update database records.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination Controls */}
      {students.length > 0 && (
        <div className="flex items-center justify-between pt-3 text-xs text-slate-450">
          <span>
            Showing page <span className="font-semibold text-slate-700">{page}</span> of{" "}
            <span className="font-semibold text-slate-700">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
