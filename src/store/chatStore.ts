// src/store/chatStore.ts
import { create } from 'zustand';
import type { Message } from '../types/chat';

interface ChatStore {
  messages: Message[];
  isMasterMode: boolean;
  sendMessage: (text: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isMasterMode: true,
  
  sendMessage: (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    
    set((state) => ({ 
      messages: [...state.messages, userMessage],
      isMasterMode: false, // сразу переключаем режим
    }));
    
    // Имитация ответа
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Ты написал: "${text}". Это AI ассистент!`,
      };
      
      set((state) => ({ messages: [...state.messages, botMessage] }));
    }, 500);
  },
  
  // Добавь метод для возврата в мастер-режим
  setMasterMode: (enabled: boolean) => set({ isMasterMode: enabled }),
}));