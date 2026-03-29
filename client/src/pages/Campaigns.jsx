import { useState } from 'react';
import { Plus, Folder, Trash2, LayoutGrid, List, ArrowRight, BarChart3, Users, Mail } from 'lucide-react';
import { useCampaigns } from '../hooks/useCampaigns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Campaigns = () => {
  const { campaigns, loading, createCampaign, deleteCampaign } = useCampaigns();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await createCampaign({ name, description });
      setName('');
      setDescription('');
      setShowForm(false);
      toast.success('Campaign created!');
    } catch (err) {
      toast.error('Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? leads will not be deleted, just un-assigned.')) return;
    try {
      await deleteCampaign(id);
      toast.success('Campaign deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading && campaigns.length === 0) {
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
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Campaigns</h1>
          <p className="text-zinc-500 mt-1 font-medium">Organize and track your lead generation efforts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {showForm && (
        <div className="minimal-box rounded-xl p-8 fade-in shadow-sm">
          <h3 className="text-lg font-bold text-black mb-6">New Campaign</h3>
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="input-label">Campaign Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Real Estate agencies in NY"
                className="input-base"
                required
              />
            </div>
            <div>
              <label className="input-label">Description (Optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Targeting residential agents for outreach..."
                className="input-base min-h-[100px] py-3"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={creating} className="btn-primary disabled:opacity-60">
                {creating ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="minimal-box rounded-2xl p-20 text-center border-dashed border-2">
          <Folder className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
          <p className="text-zinc-900 text-lg font-bold">No campaigns yet</p>
          <p className="text-zinc-500 text-sm mt-1 font-medium max-w-sm mx-auto">
            Create your first campaign to group your leads and track performance effectively.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 text-sm font-bold text-black hover:underline"
          >
            + Create your first campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(c => (
            <div key={c._id} className="minimal-box rounded-2xl p-6 group hover:border-black transition-all duration-300 relative overflow-hidden">
              <div className="flex items-start justify-between mb-6">
                <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-black group-hover:border-black transition-colors">
                  <Folder className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                </div>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="p-2 text-zinc-300 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-zinc-900 mb-1 tracking-tight truncate">{c.name}</h3>
              <p className="text-xs text-zinc-500 font-medium line-clamp-2 h-8">{c.description || 'No description provided.'}</p>

              <div className="mt-8 pt-6 border-t border-zinc-50 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xl font-black text-black">{c.stats?.totalLeads || 0}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Leads</p>
                </div>
                <div>
                  <p className="text-xl font-black text-black">{c.stats?.withEmail || 0}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Emails</p>
                </div>
                <div>
                  <p className="text-xl font-black text-black">{c.stats?.avgScore || 0}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Score</p>
                </div>
              </div>

              <Link
                to={`/dashboard/leads?campaignId=${c._id}`}
                className="mt-6 w-full py-3 rounded-xl bg-zinc-50 text-black text-sm font-bold flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all group/btn"
              >
                View Leads
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Campaigns;
