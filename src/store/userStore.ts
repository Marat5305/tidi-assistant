// src/store/userStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Тип для данных пользователя
interface User {
  name: string;
  email: string;
  department: string;
  avatar?: string; // на будущее
}

interface UserState {
  user: User;
  isLoaded: boolean; // загружены ли данные (для индикатора загрузки)
}

interface UserActions {
  updateUser: (updates: Partial<User>) => void;
  loadUser: () => Promise<void>; // для загрузки с сервера
  resetUser: () => void;
}

type UserStore = UserState & UserActions;

// Начальные данные (потом заменим на загрузку с API)
const defaultUser: User = {
  name: 'Анна Иванова',
  email: 'anna@tidi.ai',
  department: 'Отдел разработки',
};

export const useUserStore = create<UserStore>()(
  devtools(
    (set) => ({
      // Начальное состояние
      user: defaultUser,
      isLoaded: false,

      // Обновление пользователя (частичное)
      updateUser: (updates) =>
        set((state) => ({
          user: { ...state.user, ...updates },
        })),

      // Загрузка данных с сервера (пока заглушка)
      loadUser: async () => {
        // TODO: заменить на реальный API-запрос
        // const response = await api.getUser();
        // set({ user: response.data, isLoaded: true });
        
        // Пока просто имитируем задержку
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ isLoaded: true });
      },

      // Сброс к значениям по умолчанию (при выходе из аккаунта)
      resetUser: () => set({ user: defaultUser, isLoaded: false }),
    }),
    { name: 'user-store' }
  )
);