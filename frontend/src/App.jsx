import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext';
import { useStudents } from './hooks/useStudents';
import StudentForm from './components/StudentForm';
import StudentGrid from './components/StudentGrid';
import EditDrawer from './components/EditDrawer';
import ConfirmModal from './components/ConfirmModal';
import StatsCard from './components/StatsCard';
import { GraduationCap, ShieldAlert, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

function DashboardContent() {
  const [filters, setFilters] = useState({
    search: '',
    qualification: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    limit: 5
  });

  // Modal controller for new registration
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Edit Drawer state
  const [editingStudent, setEditingStudent] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Delete Modal state
  const [deletingStudentId, setDeletingStudentId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Force Light Mode on mount
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Get data queries and mutations from custom hook
  const {
    studentsQuery,
    statsQuery,
    createStudent,
    isCreating,
    updateStudent,
    isUpdating,
    deleteStudent,
    isDeleting
  } = useStudents(filters);

  const handleRegisterStudent = async (data) => {
    try {
      await createStudent(data);
      setIsRegisterOpen(false); // Close modal on success
    } catch (e) {
      // Error handled by query mutation
    }
  };

  const handleOpenEdit = (student) => {
    const formattedStudent = {
      ...student,
      dob: student.dob ? student.dob.split('T')[0] : ''
    };
    setEditingStudent(formattedStudent);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      await updateStudent({ id: editingStudent.id, data: updatedData });
      setIsEditOpen(false);
      setEditingStudent(null);
    } catch (e) {
      // Error handled by query mutation
    }
  };

  const handleOpenDelete = (id) => {
    setDeletingStudentId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteStudent(deletingStudentId);
      setIsDeleteOpen(false);
      setDeletingStudentId(null);
    } catch (e) {
      // Error handled by query mutation
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      
      {/* Sticky Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-250/50 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                Academix Registry
              </h1>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mt-1">
                Student Information System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Register Trigger Action Button */}
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Register Student
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Connection issue banner */}
        {(studentsQuery.isError || statsQuery.isError) && (
          <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-750 text-xs font-semibold flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <div>
              <h4 className="font-bold">Database Server Connection Issue</h4>
              <p className="text-[11px] text-rose-600/90 mt-0.5">
                {studentsQuery.error?.message || statsQuery.error?.message}
              </p>
            </div>
          </div>
        )}

        {/* 1. Statistics Cards Row at the top */}
        <StatsCard stats={statsQuery.data || {}} isLoading={statsQuery.isLoading} />

        {/* 2. Main registry Database panel */}
        <div className="premium-card rounded-2xl p-6">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900">
              Registry Database Records
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage registered student profiles, sort entries, and search streams.
            </p>
          </div>
          
          <StudentGrid
            students={studentsQuery.data?.students || []}
            total={studentsQuery.data?.total || 0}
            filters={filters}
            setFilters={setFilters}
            isLoading={studentsQuery.isLoading}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </div>
      </main>

      {/* Center Modal for Student Registration */}
      <AnimatePresence>
        {isRegisterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegisterOpen(false)}
              className="absolute inset-0 bg-slate-900/10 backdrop-blur-xs"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10 relative"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-150">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Register New Profile
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Add new student information records into the database.
                  </p>
                </div>
                <button
                  onClick={() => setIsRegisterOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                <StudentForm
                  onSubmit={handleRegisterStudent}
                  isLoading={isCreating}
                  onCancel={() => setIsRegisterOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-in Edit Drawer */}
      <EditDrawer
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingStudent(null);
        }}
        studentData={editingStudent}
        onSubmit={handleSaveEdit}
        isLoading={isUpdating}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingStudentId(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Student Record"
        message="Are you sure you want to permanently delete this student record? This operation cannot be undone."
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <DashboardContent />
      </ToastProvider>
    </QueryClientProvider>
  );
}
