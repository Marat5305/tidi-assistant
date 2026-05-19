import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

<<<<<<< HEAD
type Theme = 'light' | 'dark' | 'system';

interface UIState {
  isSidebarOpen: boolean;
  theme: Theme;
  activeModal: string | null;
  inputValue: string;
  isLoading: boolean;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setInputValue: (value: string) => void;
  setLoading: (loading: boolean) => void;
  resetUI: () => void;
}

type UIStore = UIState & UIActions;

const applyTheme = (theme: Theme): void => {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);
};

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      isSidebarOpen: true,
      theme: 'system',
      activeModal: null,
      inputValue: '',
      isLoading: false,

      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ isSidebarOpen: open });
      },

      setTheme: (theme: Theme) => {
        set({ theme });
        applyTheme(theme);
      },

      openModal: (modalId: string) => {
        set({ activeModal: modalId });
      },

      closeModal: () => {
        set({ activeModal: null });
      },

      setInputValue: (value: string) => {
        set({ inputValue: value });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      resetUI: () => {
        set({
          isSidebarOpen: true,
          activeModal: null,
          inputValue: '',
          isLoading: false,
        });
      },
    }),
    { name: 'ui-store' }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      const { theme } = useUIStore.getState();
      if (theme === 'system') {
        applyTheme('system');
      }
    });
}
=======
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
>>>>>>> a4f90794be3158caa02ff866192b848283b5196f
