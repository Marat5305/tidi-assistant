// src/store/chatStore.ts
import { create } from 'zustand';
import type { Message, Citation, Thread } from '../types/chat';

interface ChatState {
  // Состояние
  messages: Message[];
  threads: Thread[];
  activeThreadId: string | null;
  isStreaming: boolean;
  streamingMessageId: string | null;
  streamingContent: string;
  citations: Citation[];
  error: string | null;
  
  // Действия с сообщениями
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, content: string) => void;
  updateStreamingMessage: (messageId: string, content: string) => void;
  finalizeStreamingMessage: (finalMessage: Message | null) => void;
  
  // Действия с тредами
  addThread: (thread: Thread) => void;
  updateThread: (threadId: string, updates: Partial<Thread>) => void;
  deleteThread: (threadId: string) => void;
  setActiveThread: (threadId: string | null) => void;
  setThreads: (threads: Thread[]) => void;
  
  // Действия с состоянием
  setStreaming: (isStreaming: boolean) => void;
  setCitations: (citations: Citation[]) => void;
  setError: (error: string | null) => void;
  clearStreamingContent: () => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  // Начальное состояние
  messages: [],
  threads: [],
  activeThreadId: null,
  isStreaming: false,
  streamingMessageId: null,
  streamingContent: '',
  citations: [],
  error: null,

  // Добавление сообщения
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  // Обновление сообщения по ID
  updateMessage: (messageId, content) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, content } : msg
      ),
    }));
  },

  // Обновление стримингового сообщения
  updateStreamingMessage: (messageId, content) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, content, status: 'streaming' } : msg
      ),
      streamingContent: content,
    }));
  },

  // Финальное сохранение стримингового сообщения
  finalizeStreamingMessage: (finalMessage) => {
    set((state) => {
      if (finalMessage === null) {
        // Удаляем стриминговое сообщение
        return {
          messages: state.messages.filter((msg) => msg.status !== 'streaming'),
          streamingContent: '',
          isStreaming: false,
          streamingMessageId: null,
        };
      }
      
      // Заменяем стриминговое сообщение на финальное
      return {
        messages: state.messages.map((msg) =>
          msg.id === finalMessage.id || msg.status === 'streaming'
            ? finalMessage
            : msg
        ),
        streamingContent: '',
        isStreaming: false,
        streamingMessageId: null,
      };
    });
  },

  // Добавление треда
  addThread: (thread) => {
    set((state) => ({
      threads: [thread, ...state.threads],
    }));
  },

  // Обновление треда
  updateThread: (threadId, updates) => {
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, ...updates } : thread
      ),
    }));
  },

  // Удаление треда
  deleteThread: (threadId) => {
    set((state) => ({
      threads: state.threads.filter((thread) => thread.id !== threadId),
      messages: state.messages.filter((msg) => msg.threadId !== threadId),
      activeThreadId: state.activeThreadId === threadId ? null : state.activeThreadId,
    }));
  },

  // Установка активного треда
  setActiveThread: (threadId) => {
    set({ activeThreadId: threadId });
  },

  // Установка списка тредов
  setThreads: (threads) => {
    set({ threads });
  },

  // Установка состояния стриминга
  setStreaming: (isStreaming) => {
    set({ isStreaming });
  },

  // Установка цитат
  setCitations: (citations) => {
    set({ citations });
  },

  // Установка ошибки
  setError: (error) => {
    set({ error });
  },

  // Очистка стримингового контента
  clearStreamingContent: () => {
    set({ streamingContent: '' });
  },

  // Очистка всех сообщений
  clearMessages: () => {
    set({ messages: [] });
  },
}));