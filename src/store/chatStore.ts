// src/store/chatStore.ts
import { create } from 'zustand';
import type { Message, Citation } from '../types/chat';

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
      const mockCitations: Citation[] = [
        {
          id: 'c1',
          number: 1,
          title: 'ГОСТ Р 7.0.97-2016',
          snippet: 'Система стандартов по информации, библиотечному и издательскому делу. Организационно-распорядительная документация.',
          url: 'https://protect.gost.ru/document.aspx?control=7&id=123456',
        },
        {
          id: 'c2',
          number: 2,
          title: 'Регламент электронного документооборота',
          snippet: 'Порядок обработки входящих документов и распределения по исполнителям в течение 24 часов.',
        },
        {
          id: 'c3',
          number: 3,
          title: 'Методические указания по делопроизводству',
          snippet: 'Рекомендации по оформлению служебных записок и работе с обращениями граждан.',
        },
      ];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Ты написал: "${text}". Это AI ассистент! Согласно [citation:1], а также [citation:2] и [citation:3].`,
        citations: mockCitations,
      };
      
      set((state) => ({ messages: [...state.messages, botMessage] }));
    }, 500);
  },
  
  // Добавь метод для возврата в мастер-режим
  setMasterMode: (enabled: boolean) => set({ isMasterMode: enabled }),
}));