import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Play, Pause, Clock } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', keyword: '', location: '', radius: 10, mode: 'scraper', schedule: 'daily',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data } = await api.get('/schedules');
      setSchedules(data.schedules);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.keyword || !form.location) {
      toast.error('Fill in all required fields');
      return;
    }
    setCreating(true);
    try {
      const { data } = await api.post('/schedules', form);
      setSchedules(prev => [data.schedule, ...prev]);
      setShowForm(false);
      setForm({ name: '', keyword: '', location: '', radius: 10, mode: 'scraper', schedule: 'daily' });
      toast.success('Schedule created!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await api.put(`/schedules/${id}`, { isActive: !isActive });
      setSchedules(prev => prev.map(s => s._id === id ? { ...s, isActive: !isActive } : s));
      toast.success(isActive ? 'Schedule paused' : 'Schedule activated');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const runNow = async (id) => {
    try {
      await api.post(`/schedules/${id}/run`);
      toast.success('Job started!');
    } catch (err) {
      toast.error('Failed to run');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/schedules/${id}`);
      setSchedules(prev => prev.filter(s => s._id !== id));
      toast.success('Schedule deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

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
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Automations</h1>
          <p className="text-zinc-500 mt-1 font-medium">Schedule recurring background extractions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="minimal-box rounded-xl p-8 fade-in">
          <h3 className="text-lg font-bold text-black mb-5">Create Schedule</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="input-label">Preset Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="My Daily Search"
                className="input-base"
                required
              />
            </div>
            <div>
              <label className="input-label">Keyword</label>
              <input
                type="text"
                value={form.keyword}
                onChange={e => setForm({ ...form, keyword: e.target.value })}
                placeholder="digital marketing agency"
                className="input-base"
                required
              />
            </div>
            <div>
              <label className="input-label">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="Mumbai, India"
                className="input-base"
                required
              />
            </div>
            <div>
              <label className="input-label">Frequency</label>
              <select
                value={form.schedule}
                onChange={e => setForm({ ...form, schedule: e.target.value })}
                className="input-base"
              >
                <option value="daily">Daily (6 AM)</option>
                <option value="weekly">Weekly (Monday 6 AM)</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={creating} className="btn-primary disabled:opacity-60">
                {creating ? 'Creating...' : 'Save Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedule List */}
      {schedules.length === 0 ? (
        <div className="minimal-box rounded-2xl p-16 text-center">
          <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-900 text-lg font-bold">No schedules active</p>
          <p className="text-zinc-500 text-sm mt-1 font-medium">Create a schedule to automate your searches.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {schedules.map(s => (
            <div key={s._id} className="minimal-box rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">{s.name}</h3>
                  <p className="text-sm font-semibold text-zinc-500 mt-1">{s.keyword} <span className="mx-1.5 opacity-40">•</span> {s.location}</p>
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border ${
                  s.isActive
                    ? 'bg-black text-white border-black shadow'
                    : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                }`}>
                  {s.isActive ? 'Active' : 'Paused'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 mb-6 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                <span className="flex items-center gap-1.5 text-zinc-900">
                  <Clock className="w-4 h-4" />
                  {s.schedule === 'daily' ? 'Daily at 6 AM' : 'Weekly on Monday'}
                </span>
                <span className="w-px h-4 bg-zinc-200" />
                <span>Last Run: {s.lastRunAt ? new Date(s.lastRunAt).toLocaleDateString() : 'Never'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(s._id, s.isActive)}
                  className="btn-secondary px-3 py-2 text-xs flex items-center gap-1.5"
                >
                  {s.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {s.isActive ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => runNow(s._id)}
                  className="btn-secondary px-3 py-2 text-xs flex items-center gap-1.5 hover:border-black hover:text-black hover:bg-white"
                >
                  <Play className="w-3.5 h-3.5" />
                  Run Now
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="btn-danger px-3 py-2 text-xs flex items-center gap-1.5 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Schedules;
