import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/client';
import StatsCards from '../components/StatsCards';
import { useSocket } from '../hooks/useSocket';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { onUserUpdate } = useSocket();

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh on job updates
  useEffect(() => {
    const unsub = onUserUpdate(() => fetchData());
    return unsub;
  }, [onUserUpdate]);

  const fetchData = async () => {
    try {
      const [statsRes, jobsRes] = await Promise.all([
        api.get('/leads/stats'),
        api.get('/jobs', { params: { limit: 5 } }),
      ]);
      setStats(statsRes.data);
      setRecentJobs(jobsRes.data.jobs);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    running: 'bg-black text-white border-black',
    enriching: 'bg-zinc-800 text-zinc-100 border-zinc-800',
    scoring: 'bg-zinc-600 text-white border-zinc-600',
    completed: 'bg-white text-zinc-900 border-zinc-300',
    failed: 'bg-red-50 text-red-600 border-red-200',
  };

  const chartData = stats?.tagStats
    ? Object.entries(stats.tagStats).map(([name, count]) => ({ name, count }))
    : [
        { name: 'High Potential', count: 0 },
        { name: 'Premium', count: 0 },
        { name: 'Cold', count: 0 },
      ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Overview</h1>
          <p className="text-zinc-500 mt-1font-medium">Summary of your lead generation activity</p>
        </div>
        <Link to="/search" className="btn-primary flex items-center gap-2">
          <Search className="w-4 h-4" />
          New Search
        </Link>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts + Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart */}
        <div className="lg:col-span-3 minimal-box rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-zinc-700" />
              <h2 className="text-lg font-bold text-zinc-900">Lead Distribution</h2>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              accessibilityLayer={false}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  color: '#18181b',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontWeight: 600
                }}
              />
              <Bar dataKey="count" fill="#18181b" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Jobs */}
        <div className="lg:col-span-2 minimal-box rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-700" />
              <h2 className="text-lg font-bold text-zinc-900">Recent Jobs</h2>
            </div>
            <Link to="/jobs" className="text-sm text-zinc-500 hover:text-black font-semibold flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentJobs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-zinc-500 text-sm font-medium">No jobs yet</p>
                <Link to="/search" className="text-black text-sm hover:underline font-semibold mt-2 inline-block">
                  Start your first search →
                </Link>
              </div>
            ) : (
              recentJobs.map(job => (
                <div key={job._id} className="border border-zinc-100 bg-zinc-50/50 rounded-lg p-4 hover:border-zinc-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-zinc-900 truncate max-w-[170px]">
                        {job.keyword}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 font-medium">{job.location}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide ${statusColors[job.status]}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
                    <span>{job.totalProcessed || 0} leads</span>
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
