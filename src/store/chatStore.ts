// src/store/chatStore.ts
import { create } from 'zustand';
import type { Message } from '../types/chat';

interface ChatStore {
  messages: Message[];
  sendMessage: (text: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [
    // Стартовое приветствие
    {
      id: '1',
      role: 'assistant',
      content: 'Привет! Я твой AI-помощник. Задай вопрос или загрузи файл.',
    },
  ],
  
  sendMessage: (text: string) => {
    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    
    set((state) => ({ messages: [...state.messages, userMessage] }));
    
    // Имитация ответа бота (через полсекунды)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Ты написал: "${text}". Пока это заглушка, скоро здесь будет настоящий AI!`,
      };
      
      set((state) => ({ messages: [...state.messages, botMessage] }));
    }, 500);
  },
}));