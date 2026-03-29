import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Search as SearchIcon, ChevronLeft, ChevronRight, Filter, Globe, Phone, Mail, Trash2, Folder } from 'lucide-react';
import api from '../api/client';
import ExportModal from '../components/ExportModal';
import ScoreBadge from '../components/LeadScoreBadge';
import { useCampaigns } from '../hooks/useCampaigns';
import toast from 'react-hot-toast';

const Leads = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { campaigns } = useCampaigns();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [exportOpen, setExportOpen] = useState(false);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [tag, setTag] = useState(searchParams.get('tag') || '');
  const [campaignId, setCampaignId] = useState(searchParams.get('campaignId') || '');
  const [minScore, setMinScore] = useState(searchParams.get('minScore') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '-score');
  const [selectedLeads, setSelectedLeads] = useState([]);

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l._id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedLeads.length} selected leads?`)) return;
    try {
      await api.delete('/leads', { data: { ids: selectedLeads } });
      setLeads(prev => prev.filter(l => !selectedLeads.includes(l._id)));
      setSelectedLeads([]);
      toast.success('Selected leads deleted');
    } catch (err) {
      toast.error('Bulk delete failed');
    }
  };

  const page = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchLeads();
  }, [searchParams]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leads', {
        params: Object.fromEntries(searchParams.entries())
      });
      setLeads(data.leads || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      setLeads([]);
      setPagination({ page: 1, limit: 10, total: 0, pages: 1 });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', 1); // Reset to page 1 on filter
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      const params = new URLSearchParams(searchParams);
      params.set('page', newPage);
      setSearchParams(params);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      setLeads(prev => prev.filter(l => l._id !== id));
      toast.success('Lead deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Leads Database</h1>
          <p className="text-zinc-500 mt-1 font-medium">{pagination?.total || 0} leads found</p>
        </div>
        <button
          onClick={() => setExportOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedLeads.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[40] slide-up">
          <div className="bg-black text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-8 border border-zinc-800 backdrop-blur-md">
            <div className="flex items-center gap-3 border-r border-zinc-700 pr-8">
              <span className="bg-white text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                {selectedLeads.length}
              </span>
              <span className="text-sm font-bold tracking-tight">Leads Selected</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-red-400 font-bold text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={() => setSelectedLeads([])}
                className="px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 font-bold text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="minimal-box rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search business names..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // Debounce in a real app, direct for simplicity here
              handleFilterChange('search', e.target.value);
            }}
            className="input-base pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <select
              value={campaignId}
              onChange={(e) => { setCampaignId(e.target.value); handleFilterChange('campaignId', e.target.value); }}
              className="input-base pl-9 hover:bg-zinc-50 cursor-pointer appearance-none"
            >
              <option value="">All Campaigns</option>
              {campaigns.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 md:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <select
              value={tag}
              onChange={(e) => { setTag(e.target.value); handleFilterChange('tag', e.target.value); }}
              className="input-base pl-9 hover:bg-zinc-50 cursor-pointer appearance-none"
            >
              <option value="">All Tags</option>
              <option value="Premium">Premium</option>
              <option value="High Potential">High Potential</option>
              <option value="Has Email">Has Email</option>
              <option value="Cold">Cold</option>
            </select>
          </div>

          <div className="relative flex-1 md:w-40">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); handleFilterChange('sort', e.target.value); }}
              className="input-base hover:bg-zinc-50 cursor-pointer"
            >
              <option value="-score">Highest Score</option>
              <option value="score">Lowest Score</option>
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="minimal-box rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="bg-white">
            <tr className="border-b border-zinc-200">
              <th className="px-5 py-4 w-10">
                <input
                  type="checkbox"
                  checked={leads.length > 0 && selectedLeads.length === leads.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black accent-black cursor-pointer"
                />
              </th>
              <th className="px-5 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Business</th>
              <th className="px-5 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest hidden md:table-cell">Contact</th>
              <th className="px-5 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest md:hidden">Details</th>
              <th className="px-5 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Score</th>
              <th className="px-5 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="px-5 py-6">
                    <div className="h-4 bg-zinc-100/50 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-5 py-12 text-center text-zinc-500 font-medium">
                  No leads found matching your criteria.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id} className={`table-row-hover group ${selectedLeads.includes(lead._id) ? 'bg-zinc-50' : ''}`}>
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead._id)}
                      onChange={() => toggleSelect(lead._id)}
                      className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black accent-black cursor-pointer"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-sm text-zinc-900 line-clamp-1">{lead.businessName}</div>
                    <div className="text-xs text-zinc-500 mt-1 line-clamp-1 max-w-xs">{lead.address}</div>
                    <div className="text-xs text-zinc-400 mt-1 font-semibold">{lead.category}</div>
                  </td>
                  
                  {/* Desktop Contact Column */}
                  <td className="px-5 py-4 hidden md:table-cell align-top text-xs text-zinc-600 font-medium space-y-2">
                    {lead.email && (
                      <div className="flex items-center gap-1.5 overflow-hidden text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-flex">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    )}
                    {!lead.email && <div className="text-zinc-400">---</div>}
                    
                    {lead.phone && (
                      <div className="flex items-center gap-1.5 opacity-90 mt-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    
                    {lead.website && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Globe className="w-3.5 h-3.5 text-zinc-400" />
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-black hover:underline truncate max-w-[150px]">
                          {lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </a>
                      </div>
                    )}

                    {/* Social Links Row */}
                    {(lead.facebook || lead.instagram || lead.twitter || lead.linkedin) && (
                      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-zinc-100">
                        {lead.facebook && (
                          <a href={lead.facebook} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#1877F2] transition-colors" title="Facebook">
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {lead.instagram && (
                          <a href={lead.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#E4405F] transition-colors" title="Instagram">
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {lead.twitter && (
                          <a href={lead.twitter} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-black transition-colors" title="Twitter / X">
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {lead.linkedin && (
                          <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#0A66C2] transition-colors" title="LinkedIn">
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Mobile Details Column */}
                  <td className="px-5 py-4 md:hidden align-top text-xs space-y-1">
                    {lead.email && <div className="font-bold text-black truncate">{lead.email}</div>}
                    {lead.phone && <div className="text-zinc-500">{lead.phone}</div>}
                  </td>

                  <td className="px-5 py-4 align-top">
                    <ScoreBadge score={lead.score} tags={lead.tags} />
                  </td>

                  <td className="px-5 py-4 align-top text-right">
                    <button
                      onClick={() => handleDelete(lead._id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 pt-4 px-2">
          <p className="text-sm text-zinc-500 font-medium">
            Showing <span className="font-bold text-black">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-bold text-black">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-bold text-black">{pagination.total}</span> leads
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 disabled:opacity-50 hover:bg-zinc-50 disabled:hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 disabled:opacity-50 hover:bg-zinc-50 disabled:hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        filters={Object.fromEntries(searchParams.entries())}
      />
    </div>
  );
};

export default Leads;
