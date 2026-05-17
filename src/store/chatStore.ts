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
        {
          id: 'c4',
          number: 4,
          title: 'ГОСТ Р 7.0.97-2016',
          snippet: 'Библиотечное и издательское дело. Организационно-распорядительная документация.',
          url: 'https://protect.gost.ru/document.aspx?control=7&id=123456',
        },
        {
          id: 'c5',
          number: 5,
          title: 'Перечень электронного документооборота',
          snippet: 'Порядок обработки входящих документов и распределения по исполнителям в течение 24 часов.',
        },
        {
          id: 'c6',
          number: 6,
          title: 'Указания по делопроизводству',
          snippet: 'Рекомендации по оформлению служебных записок и работе с обращениями граждан.',
        },
        {
          id: 'c7',
          number: 7,
          title: 'Конституция РФ',
          snippet: 'Записок и работе с обращениями граждан.',
        },
      ];

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Ты написал: "${text}". Согласно [citation:1], а также [citation:2], [citation:3], [citation:4], [citation:5], [citation:6], [citation:7]`,
        citations: mockCitations,
      };
      
      set((state) => ({ messages: [...state.messages, botMessage] }));
    }, 500);
  },
  
  // Добавь метод для возврата в мастер-режим
  setMasterMode: (enabled: boolean) => set({ isMasterMode: enabled }),
}));