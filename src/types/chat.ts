// src/types/chat.ts

// ============= Типы бэкенда (соответствуют API FastAPI) =============

/**
 * Сессия/чат из бэкенда
 * GET /sessions, POST /sessions, PATCH /sessions/{id}
 */
export interface BackendSession {
  id: number;
  title: string | null;
  created_at: string;  // ISO format
  updated_at: string;  // ISO format
}

/**
 * Сообщение из бэкенда
 * GET /sessions/{id}/messages
 */
export interface BackendMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  sources: string[] | null;
  created_at: string;  // ISO format
  feedback: {
    vote: boolean | null;
    comment: string | null;
  } | null;
}

/**
 * Чанк с источниками из бэкенда (приходит в stream)
 * {"chunks": [{"text": "...", "source": "...", "score": 0.95}]}
 */
export interface BackendChunk {
  text: string;
  source: string;
  score: number;
}

/**
 * Токен текста из бэкенда (приходит в stream)
 * {"token": "..."}
 */
export interface BackendToken {
  token: string;
}

/**
 * ID сообщения из бэкенда (приходит в конце stream)
 * {"message_id": 123}
 */
export interface BackendMessageId {
  message_id: number;
}

// ============= Типы для фронтенда =============

/**
 * Цитата/источник (объединенная версия для фронтенда)
 */
export interface Citation {
  id?: string;              // Опциональный ID для React keys
  text: string;            // Текст цитаты/фрагмента
  source: string;          // Источник (URL или название)
  score?: number;          // Оценка релевантности (0-1)
  url?: string;            // URL источника
  page?: number;           // Номер страницы (если есть)
  title?: string;          // Заголовок источника
  snippet?: string;        // Краткий отрывок
  number?: number;         // Номер цитаты для отображения
  relevanceScore?: number; // Альтернативное название для score
}

/**
 * Вложение файла
 */
export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: 'uploading' | 'uploaded' | 'error';
  progress: number;
}

/**
 * Сообщение в чате (фронтенд)
 */
export interface Message {
  id: string;                    // Строковый ID (может быть временным или из бэкенда)
  threadId: string;              // ID треда (сессии)
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];        // Цитаты/источники (из поле sources бэкенда)
  attachments?: FileAttachment[];
  timestamp: number;             // Unix timestamp в миллисекундах
  status: 'sending' | 'sent' | 'streaming' | 'error';
  tokenCount?: number;
  suggestions?: SuggestionAction[];
  backendId?: number;            // Оригинальный ID из бэкенда (если сохранено)
}

/**
 * Тред/Чат (фронтенд)
 */
export interface Thread {
  id: string;                    // Строковый ID (число из бэкенда как строка)
  title: string;
  lastMessage?: string;
  messages: Message[];
  createdAt: number;             // Unix timestamp в миллисекундах
  updatedAt: number;             // Unix timestamp в миллисекундах
  isPinned?: boolean;
  contextTokens?: number;
  backendId?: number;            // Оригинальный ID из бэкенда
}

/**
 * Чанк потока данных (для StreamParser)
 */
export interface StreamChunk {
  type: 'text' | 'citation' | 'error' | 'done' | 'metadata' | 'chunks';
  content?: string;              // Текстовый контент (для type='text')
  citation?: Citation;          // Цитата (для type='citation')
  chunks?: BackendChunk[];      // Массив чанков (для type='chunks')
  messageId?: number;           // ID сообщения (для type='done')
  error?: string;               // Сообщение об ошибке (для type='error')
  metadata?: {
    tokensUsed?: number;
    model?: string;
    threadId?: string;
  };
}

/**
 * Запрос чата
 */
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

/**
 * Данные для виртуального скролла
 */
export interface VirtualScrollData {
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
}

/**
 * Результат парсинга потока
 */
export interface StreamParserResult {
  chunks: StreamChunk[];
  remainingBuffer: string;
}

/**
 * Кнопка-подсказка
 */
export interface SuggestionAction {
  id: string;
  label: string;   // Текст на кнопке, например "Разверни подробнее"
  prompt: string;  // Что отправить при клике
}

// ============= Функции-конвертеры =============

/**
 * Конвертирует BackendMessage в Message
 */
export function convertBackendMessageToMessage(
  backendMsg: BackendMessage,
  threadId: string
): Message {
  // Конвертируем sources в citations
  const citations: Citation[] | undefined = backendMsg.sources?.map((source, idx) => ({
    id: `${backendMsg.id}-citation-${idx}`,
    text: source,
    source: source,
    url: source,
    title: source.split('/').pop() || source,
    snippet: source,
    relevanceScore: 1,
    number: idx + 1,
  }));

  return {
    id: String(backendMsg.id),
    threadId,
    role: backendMsg.role,
    content: backendMsg.content,
    citations,
    timestamp: new Date(backendMsg.created_at).getTime(),
    status: 'sent',
    backendId: backendMsg.id,
  };
}

/**
 * Конвертирует BackendSession в Thread
 */
export function convertBackendSessionToThread(
  backendSession: BackendSession,
  messages: Message[] = []
): Thread {
  return {
    id: String(backendSession.id),
    title: backendSession.title || 'Новый чат',
    messages,
    createdAt: new Date(backendSession.created_at).getTime(),
    updatedAt: new Date(backendSession.updated_at).getTime(),
    backendId: backendSession.id,
  };
}

/**
 * Конвертирует BackendChunk в Citation
 */
export function convertBackendChunkToCitation(
  chunk: BackendChunk,
  index: number
): Citation {
  return {
    id: `chunk-${index}`,
    text: chunk.text,
    source: chunk.source,
    score: chunk.score,
    relevanceScore: chunk.score,
    url: chunk.source,
    title: chunk.source.split('/').pop() || chunk.source,
    snippet: chunk.text,
    number: index + 1,
  };
}

/**
 * Создает временное сообщение пользователя (оптимистичное обновление UI)
 */
export function createOptimisticUserMessage(
  threadId: string,
  content: string,
  temporaryId?: string
): Message {
  return {
    id: temporaryId || `temp-${Date.now()}`,
    threadId,
    role: 'user',
    content,
    timestamp: Date.now(),
    status: 'sending',
  };
}

/**
 * Создает временное сообщение ассистента для стриминга
 */
export function createStreamingAssistantMessage(threadId: string): Message {
  return {
    id: `streaming-${Date.now()}`,
    threadId,
    role: 'assistant',
    content: '',
    timestamp: Date.now(),
    status: 'streaming',
  };
}

/**
 * Проверяет, является ли объект BackendMessage
 */
export function isBackendMessage(obj: unknown): obj is BackendMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'role' in obj &&
    'content' in obj &&
    'created_at' in obj
  );
}

/**
 * Проверяет, является ли объект BackendSession
 */
export function isBackendSession(obj: unknown): obj is BackendSession {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'created_at' in obj &&
    'updated_at' in obj
  );
}