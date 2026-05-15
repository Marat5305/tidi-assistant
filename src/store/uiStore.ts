import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeAgent: string | null;
  setActiveAgent: (agentId: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  activeAgent: null,
  setActiveAgent: (agentId) => set({ activeAgent: agentId }),
}));