import { create } from 'zustand';
import type { Campaign, CampaignType, CampaignStatus } from '../types';

interface CampaignFilters {
  status?: CampaignStatus;
  type?: CampaignType;
  search?: string;
}

interface CampaignState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  filters: CampaignFilters;
  builderStep: number;
  builderData: Partial<Campaign>;

  setCampaigns: (campaigns: Campaign[]) => void;
  selectCampaign: (campaign: Campaign | null) => void;
  setFilters: (filters: CampaignFilters) => void;
  setBuilderStep: (step: number) => void;
  updateBuilderData: (data: Partial<Campaign>) => void;
  resetBuilder: () => void;
  updateCampaignInList: (campaign: Campaign) => void;
  removeCampaignFromList: (id: string) => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: [],
  selectedCampaign: null,
  filters: {},
  builderStep: 0,
  builderData: {},

  setCampaigns: (campaigns) => set({ campaigns }),
  selectCampaign: (selectedCampaign) => set({ selectedCampaign }),
  setFilters: (filters) => set({ filters }),
  setBuilderStep: (builderStep) => set({ builderStep }),
  updateBuilderData: (data) => set((state) => ({ builderData: { ...state.builderData, ...data } })),
  resetBuilder: () => set({ builderStep: 0, builderData: {} }),

  updateCampaignInList: (campaign) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) => (c.id === campaign.id ? campaign : c)),
    })),

  removeCampaignFromList: (id) =>
    set((state) => ({ campaigns: state.campaigns.filter((c) => c.id !== id) })),
}));
