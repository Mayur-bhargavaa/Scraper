import { useState, useEffect, useCallback } from 'react';
import { Briefcase, RefreshCw, MapPin } from 'lucide-react';
import api from '../api/client';
import { useSocket } from '../hooks/useSocket';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const { onUserUpdate } = useSocket();

  useEffect(() => {
    fetchJobs();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    const unsub = onUserUpdate((data) => {
      setJobs(prev => prev.map(j =>
        j._id === data.jobId ? { ...j, ...(data.status && { status: data.status }) } : j
      ));
      if (data.message) {
        setProgress(prev => ({ ...prev, [data.jobId]: data }));
      }
    });
    return unsub;
  }, [onUserUpdate]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/jobs', { params: { limit: 50 } });
      setJobs(data.jobs);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending: { color: 'bg-zinc-500', text: 'text-zinc-600', bg: 'bg-zinc-100 border-zinc-200' },
    running: { color: 'bg-black', text: 'text-white', bg: 'bg-black border-black' },
    enriching: { color: 'bg-zinc-800', text: 'text-zinc-100', bg: 'bg-zinc-800 border-zinc-800' },
    scoring: { color: 'bg-zinc-600', text: 'text-white', bg: 'bg-zinc-600 border-zinc-600' },
    completed: { color: 'bg-zinc-300', text: 'text-zinc-900', bg: 'bg-white border-zinc-300' },
    failed: { color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  };

  const isActive = (status) => ['running', 'enriching', 'scoring'].includes(status);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Jobs</h1>
          <p className="text-zinc-500 mt-0.5 font-medium">Monitor your scraping jobs in real-time</p>
        </div>
        <button onClick={fetchJobs} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="minimal-box rounded-2xl p-16 text-center">
          <Briefcase className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-900 text-lg font-bold">No jobs yet</p>
          <p className="text-zinc-500 text-sm mt-1 font-medium">Start a new search to create your first job</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {jobs.map(job => {
            const config = statusConfig[job.status] || statusConfig.pending;
            const prog = progress[job._id];

            return (
              <div key={job._id} className="minimal-box rounded-xl p-6 hover:border-black transition-all duration-300">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-lg font-bold text-zinc-900">{job.keyword}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${config.bg} ${config.text}`}>
                        {isActive(job.status) && (
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.color} mr-1.5 pulse-dot`} />
                        )}
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                      <span>Radius: {job.radius}km</span>
                      <span>{job.mode.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs font-medium">
                    <p className="text-zinc-500">{new Date(job.createdAt).toLocaleString()}</p>
                    {job.completedAt && (
                      <p className="text-zinc-400 mt-1">
                        Completed: {new Date(job.completedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress */}
                {isActive(job.status) && prog && (
                  <div className="mb-6 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-zinc-700">{prog.message}</p>
                      {prog.found > 0 && (
                        <p className="text-sm font-bold text-black tabular-nums">
                          {prog.processed || 0} <span className="text-zinc-400 font-medium">/ {prog.found}</span>
                        </p>
                      )}
                    </div>
                    {prog.found > 0 && (
                      <div className="h-2.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, ((prog.processed || 0) / prog.found) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-center">
                    <p className="text-xl font-extrabold text-zinc-900">{job.totalFound || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mt-1">Found</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-center">
                    <p className="text-xl font-extrabold text-black">{job.totalProcessed || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mt-1">Unique</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-center">
                    <p className="text-xl font-extrabold text-black">{job.totalEnriched || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mt-1">Enriched</p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-center">
                    <p className="text-xl font-extrabold text-zinc-400">{job.totalDuplicates || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mt-1">Duplicates</p>
                  </div>
                </div>

                {/* Error */}
                {job.status === 'failed' && job.errorMessage && (
                  <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm font-medium text-red-700">
                    {job.errorMessage}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Jobs;
