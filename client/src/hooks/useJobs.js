import { useState, useCallback } from 'react';
import api from '../api/client';

export const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchJobs = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/jobs', { params });
      setJobs(data.jobs);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = useCallback(async (jobData) => {
    const { data } = await api.post('/jobs', jobData);
    setJobs(prev => [data.job, ...prev]);
    return data.job;
  }, []);

  const updateJobInList = useCallback((jobId, updates) => {
    setJobs(prev => prev.map(j => j._id === jobId ? { ...j, ...updates } : j));
  }, []);

  return { jobs, loading, pagination, fetchJobs, createJob, updateJobInList };
};
