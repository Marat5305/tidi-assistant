// src/types/chat.ts

export interface Citation {
  id: string;
  number: number;
  title: string;
  url?: string;
  snippet: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}