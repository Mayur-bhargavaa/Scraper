import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Radius, Zap, Globe, FolderPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useJobs } from '../hooks/useJobs';
import { useCampaigns } from '../hooks/useCampaigns';

const NewSearch = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(10);
  const [mode, setMode] = useState('scraper');
  const [campaignId, setCampaignId] = useState('');
  const [loading, setLoading] = useState(false);
  const { createJob } = useJobs();
  const { campaigns } = useCampaigns();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword.trim() || !location.trim()) {
      toast.error('Please fill in keyword and location');
      return;
    }

    setLoading(true);
    try {
      const job = await createJob({ keyword, location, radius, mode, campaignId });
      toast.success('Search job started!');
      navigate('/dashboard/jobs');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start search');
    } finally {
      setLoading(false);
    }
  };

  const popularSearches = [
    { keyword: 'Digital Marketing Agency', location: 'New York, USA' },
    { keyword: 'Real Estate Agent', location: 'Mumbai, India' },
    { keyword: 'Restaurant', location: 'London, UK' },
    { keyword: 'Dentist', location: 'Los Angeles, USA' },
    { keyword: 'Plumber', location: 'Sydney, Australia' },
    { keyword: 'Lawyer', location: 'Toronto, Canada' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-black flex items-center justify-center shadow-md shrink-0">
            <Search className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">New Search</h1>
            <p className="text-zinc-500 mt-1 font-medium">Find business leads from Google Maps</p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="minimal-box rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Row: Keyword, Location, Popular Searches */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Keyword Field */}
            <div className="lg:col-span-4">
              <label htmlFor="keyword" className="input-label">
                <Zap className="w-3.5 h-3.5 text-black" />
                Keyword / Business Type
              </label>
              <input
                id="keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder='e.g. "digital marketing agency", "dentist"'
                className="input-base"
                required
              />
            </div>

            {/* Location Field */}
            <div className="lg:col-span-4">
              <label htmlFor="location" className="input-label">
                <MapPin className="w-3.5 h-3.5 text-black" />
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, New York"
                className="input-base"
                required
              />
            </div>

            {/* Popular Searches Field (Right Side) */}
            <div className="lg:col-span-4">
              <label className="input-label">
                <Search className="w-3.5 h-3.5 text-black" />
                Popular Searches
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Real Estate Agent', 'Restaurant', 'Lawyer', 'HVAC', 'Dentist'].map(pop => (
                  <button
                    key={pop}
                    type="button"
                    onClick={() => setKeyword(pop)}
                    className="px-2.5 py-1.5 rounded-md bg-zinc-50 border border-zinc-200 text-[11px] font-bold text-zinc-600 hover:border-black hover:text-black transition-all"
                  >
                    {pop}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Radius */}
          <div>
            <label htmlFor="radius" className="input-label flex items-center gap-2">
              <Radius className="w-3.5 h-3.5 text-black" />
              Radius: {radius} km
            </label>
            <input
              id="radius"
              type="range"
              min="1"
              max="50"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 rounded-full bg-zinc-200 appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-xs text-zinc-500 font-semibold mt-1.5">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="input-label flex items-center gap-2">
                <FolderPlus className="w-3.5 h-3.5 text-black" />
                Assign to Campaign
              </label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="input-base cursor-pointer hover:bg-zinc-50 transition-colors"
              >
                <option value="">No Campaign (Default)</option>
                {campaigns.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <p className="text-[10px] text-zinc-400 mt-1.5 font-bold uppercase tracking-wider">Organize your leads into folders</p>
            </div>
            <div>
              <label className="input-label">Search Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('scraper')}
                  className={`p-2.5 rounded-lg border-2 text-center transition-all duration-200 ${
                    mode === 'scraper'
                      ? 'border-black bg-zinc-50'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <span className="font-bold text-xs text-zinc-900 block">Scraper</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('api')}
                  className={`p-2.5 rounded-lg border-2 text-center transition-all duration-200 ${
                    mode === 'api'
                      ? 'border-black bg-zinc-50'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <span className="font-bold text-xs text-zinc-900 block">API</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting search...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Start Scraping
              </>
            )}
          </button>
        </form>
      </div>

      {/* Popular Searches */}
      <div className="minimal-box rounded-2xl p-6">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Popular Searches</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {popularSearches.map((s, i) => (
            <button
              key={i}
              onClick={() => { setKeyword(s.keyword); setLocation(s.location); }}
              className="text-left px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-black hover:bg-white transition-all duration-200 group"
            >
              <p className="text-sm text-zinc-900 font-bold truncate">{s.keyword}</p>
              <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-1 font-medium">
                <MapPin className="w-3 h-3 text-zinc-400 group-hover:text-black transition-colors" />
                {s.location}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewSearch;
