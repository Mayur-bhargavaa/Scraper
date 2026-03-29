import { useState, useEffect } from 'react';
import { Save, Key, Shield, AlertTriangle } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

const Settings = () => {
  const [keys, setKeys] = useState({
    googlePlacesApiKey: '',
    hunterApiKey: '',
    twocaptchaApiKey: '',
    proxyUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.user?.apiKeys) {
        setKeys({
          googlePlacesApiKey: data.user.apiKeys.googlePlacesApiKey || '',
          hunterApiKey: data.user.apiKeys.hunterApiKey || '',
          twocaptchaApiKey: data.user.apiKeys.twocaptchaApiKey || '',
          proxyUrl: data.user.apiKeys.proxyUrl || '',
        });
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/settings', { apiKeys: keys });
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">System Settings</h1>
        <p className="text-zinc-500 mt-1 font-medium">Configure API keys, proxies, and external integrations.</p>
      </div>

      <div className="minimal-box rounded-2xl overflow-hidden p-8">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* External APIs */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-2">
              <Key className="w-5 h-5 text-black" />
              <h2 className="text-lg font-bold text-zinc-900">API Integrations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="input-label">Google Places API Key</label>
                <input
                  type="password"
                  value={keys.googlePlacesApiKey}
                  onChange={e => setKeys({...keys, googlePlacesApiKey: e.target.value})}
                  placeholder="AIzaSy..."
                  className="input-base"
                />
                <p className="text-xs text-zinc-500 mt-1.5 font-medium">Required for API scraping mode</p>
              </div>
              <div>
                <label className="input-label">Hunter.io API Key (Email Enrichment)</label>
                <input
                  type="password"
                  value={keys.hunterApiKey}
                  onChange={e => setKeys({...keys, hunterApiKey: e.target.value})}
                  placeholder="Hunter API Key"
                  className="input-base"
                />
                <p className="text-xs text-zinc-500 mt-1.5 font-medium">Find verified employee emails automatically</p>
              </div>
            </div>
          </section>

          {/* Infrastructure */}
          <section>
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-2">
              <Shield className="w-5 h-5 text-black" />
              <h2 className="text-lg font-bold text-zinc-900">Infrastructure & Anti-Bot</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="input-label">2Captcha API Key</label>
                <input
                  type="password"
                  value={keys.twocaptchaApiKey}
                  onChange={e => setKeys({...keys, twocaptchaApiKey: e.target.value})}
                  placeholder="2Captcha token"
                  className="input-base"
                />
                <p className="text-xs text-zinc-500 mt-1.5 font-medium">Bypass ReCAPTCHA during browser scraping</p>
              </div>
              <div>
                <label className="input-label">Residential Proxy URL</label>
                <input
                  type="text"
                  value={keys.proxyUrl}
                  onChange={e => setKeys({...keys, proxyUrl: e.target.value})}
                  placeholder="http://user:pass@host:port"
                  className="input-base"
                />
                <p className="text-xs text-zinc-500 mt-1.5 font-medium">Prevent IP bans (e.g., BrightData, Smartproxy)</p>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 font-medium">
              <AlertTriangle className="w-4 h-4" />
              <span>Keys are encrypted at rest.</span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
