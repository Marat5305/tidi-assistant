// src/store/chatStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Message, Thread, Citation } from '../types/chat';
import { generateId } from '../utils/id';

interface ChatState {
  threads: Thread[];
  activeThreadId: string | null;
  isStreaming: boolean;
  messages: Message[];
  streamingMessage: string;
  activeCitations: Citation[];
  showCitationsPanel: boolean;
  error: string | null;
}

interface ChatActions {
  createThread: () => string;
  setActiveThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  updateThreadTitle: (threadId: string, title: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  appendToStreamingMessage: (chunk: string) => void;
  finalizeStreamingMessage: (finalMessage: Message) => void;
  setCitations: (citations: Citation[]) => void;
  toggleCitationsPanel: () => void;
  setStreaming: (isStreaming: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  pinThread: (threadId: string) => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()(
  devtools(
    (set, get) => ({
      // State
      threads: [],
      activeThreadId: null,
      isStreaming: false,
      messages: [],
      streamingMessage: '',
      activeCitations: [],
      showCitationsPanel: false,
      error: null,

      // Actions
      createThread: () => {
        const threadId = generateId();
        const newThread: Thread = {
          id: threadId,
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          threads: [newThread, ...state.threads],
          activeThreadId: threadId,
          messages: [],
        }));

        return threadId;
      },

      setActiveThread: (threadId: string) => {
        const { threads } = get();
        const thread = threads.find((t) => t.id === threadId);

        set({
          activeThreadId: threadId,
          messages: thread?.messages ?? [],
          activeCitations: [],
          showCitationsPanel: false,
          error: null,
        });
      },

      deleteThread: (threadId: string) => {
        set((state) => {
          const filteredThreads = state.threads.filter((t) => t.id !== threadId);
          const isActiveThread = state.activeThreadId === threadId;

          return {
            threads: filteredThreads,
            activeThreadId: isActiveThread ? null : state.activeThreadId,
            messages: isActiveThread ? [] : state.messages,
          };
        });
      },

      updateThreadTitle: (threadId: string, title: string) => {
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? { ...t, title, updatedAt: Date.now() }
              : t
          ),
        }));
      },

      addMessage: (message: Message) => {
        set((state) => {
          const newMessages = [...state.messages, message];

          return {
            messages: newMessages,
            threads: state.threads.map((t) =>
              t.id === message.threadId
                ? {
                    ...t,
                    messages: newMessages,
                    lastMessage: message.content.slice(0, 100),
                    updatedAt: Date.now(),
                  }
                : t
            ),
            error: null,
          };
        });
      },

      updateMessage: (messageId: string, updates: Partial<Message>) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, ...updates } : m
          ),
        }));
      },

      appendToStreamingMessage: (chunk: string) => {
        set((state) => ({
          streamingMessage: state.streamingMessage + chunk,
        }));
      },

      finalizeStreamingMessage: (finalMessage: Message) => {
        set((state) => {
          const newMessages = [...state.messages, finalMessage];

          return {
            messages: newMessages,
            streamingMessage: '',
            isStreaming: false,
            threads: state.threads.map((t) =>
              t.id === finalMessage.threadId
                ? {
                    ...t,
                    messages: newMessages,
                    lastMessage: finalMessage.content.slice(0, 100),
                    updatedAt: Date.now(),
                  }
                : t
            ),
          };
        });
      },

      setCitations: (citations: Citation[]) => {
        set({ activeCitations: citations });
      },

      toggleCitationsPanel: () => {
        set((state) => ({ showCitationsPanel: !state.showCitationsPanel }));
      },

      setStreaming: (isStreaming: boolean) => {
        set({ isStreaming });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearMessages: () => {
        set({ messages: [], streamingMessage: '', error: null });
      },

      pinThread: (threadId: string) => {
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? { ...t, isPinned: !t.isPinned }
              : t
          ),
        }));
      },
    }),
    { name: 'chat-store' }
  )
);