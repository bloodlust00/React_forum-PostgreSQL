import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

// BroadcastChannel to synchronise state across multiple tabs/windows
const syncChannel = new BroadcastChannel('academix_registry_sync');

export const useStudents = (filters = {}) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const {
    search = '',
    qualification = '',
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 5
  } = filters;

  const skip = (page - 1) * limit;

  // Listen for mutations in other tabs to trigger real-time updates
  useEffect(() => {
    const handleSync = (event) => {
      if (event.data === 'sync_student_records') {
        queryClient.invalidateQueries({ queryKey: ['students'] });
        queryClient.invalidateQueries({ queryKey: ['student-stats'] });
        queryClient.refetchQueries({ queryKey: ['students'] });
        queryClient.refetchQueries({ queryKey: ['student-stats'] });
      }
    };
    syncChannel.addEventListener('message', handleSync);
    return () => {
      syncChannel.removeEventListener('message', handleSync);
    };
  }, [queryClient]);

  // 1. Fetch Students query
  const studentsQuery = useQuery({
    queryKey: ['students', { search, qualification, sortBy, sortOrder, skip, limit }],
    queryFn: async () => {
      const response = await api.get('/students', {
        params: { search, qualification, sort_by: sortBy, sort_order: sortOrder, skip, limit }
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 5000,
  });

  // 2. Fetch Stats query
  const statsQuery = useQuery({
    queryKey: ['student-stats'],
    queryFn: async () => {
      const response = await api.get('/students/stats');
      return response.data;
    },
    staleTime: 5000,
  });

  // 3. Create Student mutation
  const createMutation = useMutation({
    mutationFn: async (newStudent) => {
      const response = await api.post('/students', newStudent);
      return response.data;
    },
    onSuccess: () => {
      success('Student registered successfully.');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student-stats'] });
      queryClient.refetchQueries({ queryKey: ['students'] });
      queryClient.refetchQueries({ queryKey: ['student-stats'] });
      
      // Notify other tabs
      syncChannel.postMessage('sync_student_records');
    },
    onError: (err) => {
      error(err.message || 'Failed to register student.');
    }
  });

  // 4. Update Student mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/students/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      success('Student updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student-stats'] });
      queryClient.refetchQueries({ queryKey: ['students'] });
      queryClient.refetchQueries({ queryKey: ['student-stats'] });

      // Notify other tabs
      syncChannel.postMessage('sync_student_records');
    },
    onError: (err) => {
      error(err.message || 'Failed to update student.');
    }
  });

  // 5. Delete Student mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/students/${id}`);
      return id;
    },
    onSuccess: () => {
      success('Student record deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student-stats'] });
      queryClient.refetchQueries({ queryKey: ['students'] });
      queryClient.refetchQueries({ queryKey: ['student-stats'] });

      // Notify other tabs
      syncChannel.postMessage('sync_student_records');
    },
    onError: (err) => {
      error(err.message || 'Failed to delete student.');
    }
  });

  return {
    studentsQuery,
    statsQuery,
    createStudent: createMutation.mutateAsync,
    isCreating: createMutation.isLoading || createMutation.isPending, // isPending for React Query v5
    updateStudent: updateMutation.mutateAsync,
    isUpdating: updateMutation.isLoading || updateMutation.isPending,
    deleteStudent: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isLoading || deleteMutation.isPending,
  };
};
