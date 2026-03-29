import { useState, useCallback, useEffect } from 'react';
import api from '../api/client';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/campaigns');
      setCampaigns(data.campaigns);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCampaign = async (campaignData) => {
    const { data } = await api.post('/campaigns', campaignData);
    setCampaigns(prev => [data.campaign, ...prev]);
    return data.campaign;
  };

  const deleteCampaign = async (id) => {
    await api.delete(`/campaigns/${id}`);
    setCampaigns(prev => prev.filter(c => c._id !== id));
  };

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaigns, loading, fetchCampaigns, createCampaign, deleteCampaign };
};
