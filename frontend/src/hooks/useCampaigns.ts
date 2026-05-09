import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { campaignService } from '../services/campaign.service';
import type { CampaignFormData } from '../types';

export function useCampaigns(filters?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: () => campaignService.list(filters),
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => campaignService.get(id),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CampaignFormData) => campaignService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully!');
    },
    onError: () => toast.error('Failed to create campaign'),
  });
}

export function useLaunchCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => campaignService.launch(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['campaigns', id] });
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign launched!');
    },
    onError: () => toast.error('Failed to launch campaign'),
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => campaignService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted');
    },
  });
}
