// src/types/chat.ts
export interface Citation {
  id: string;
  text: string;
  source: string;
  page?: number;
  url?: string;
  relevanceScore: number;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: 'uploading' | 'uploaded' | 'error';
  progress: number;
}

export interface Citation {
  id: string;
  number: number;
  title: string;
  url?: string;
  snippet: string;
}

export interface Message {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  attachments?: FileAttachment[];
  timestamp: number;
  status: 'sending' | 'sent' | 'streaming' | 'error';
  tokenCount?: number;
}

export interface Thread {
  id: string;
  title: string;
  lastMessage?: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  contextTokens?: number;
}

export interface StreamChunk {
  type: 'text' | 'citation' | 'error' | 'done' | 'metadata';
  content?: string;
  citation?: Citation;
  error?: string;
  metadata?: {
    tokensUsed?: number;
    model?: string;
    threadId?: string;
  };
}

export interface ChatRequest {
  threadId: string;
  message: string;
  attachments?: File[];
  contextMessages?: Array<{ role: Message['role']; content: string }>;
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  };
}

export interface VirtualScrollData {
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
}

export interface StreamParserResult {
  chunks: StreamChunk[];
  remainingBuffer: string;
}