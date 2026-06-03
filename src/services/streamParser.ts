// src/services/streamParser.ts
import type { StreamChunk, BackendChunk } from '../types/chat';

export class StreamParser {
  private buffer: string;
  private pendingChunks: BackendChunk[];

  constructor() {
    this.buffer = '';
    this.pendingChunks = [];
  }

  /**
   * Парсинг входящего чанка данных
   * @param chunk - сырые данные из потока
   * @returns массив распарсенных чанков
   */
  parse(chunk: string): StreamChunk[] {
    this.buffer += chunk;
    const chunks: StreamChunk[] = [];
    
    // Разделяем по строкам
    const lines = this.buffer.split('\n');
    
    // Последняя строка может быть неполной, сохраняем её в буфер
    this.buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length === 0) {
        continue;
      }
      
      const parsedChunks = this.parseLine(trimmedLine);
      chunks.push(...parsedChunks);
    }

    return chunks;
  }

  /**
   * Парсинг SSE формата data: {...}\n\n
   * @param sseMessage - сообщение в SSE формате
   * @returns массив распарсенных чанков
   */
  parseSSE(sseMessage: string): StreamChunk[] {
    const chunks: StreamChunk[] = [];
    const lines = sseMessage.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6).trim();
        
        if (dataStr === '[DONE]') {
          chunks.push({ type: 'done' });
          continue;
        }
        
        try {
          const jsonData = JSON.parse(dataStr);
          const parsed = this.parseJSONData(jsonData);
          chunks.push(...parsed);
        } catch {
          // Если не JSON, пробуем распарсить как обычную строку
          const parsed = this.parseLine(dataStr);
          chunks.push(...parsed);
        }
      }
    }
    
    return chunks;
  }

  /**
   * Парсинг одной строки
   * @param line - строка для парсинга
   * @returns массив распарсенных чанков
   */
  private parseLine(line: string): StreamChunk[] {
    let data: unknown;

    try {
      data = JSON.parse(line);
    } catch {
      return [{ type: 'text', content: line }];
    }

    if (!this.isValidStreamData(data)) {
      return [{ type: 'text', content: line }];
    }

    return this.parseJSONData(data);
  }

  /**
   * Парсинг JSON данных из бэкенда
   * @param data - JSON данные
   * @returns массив распарсенных чанков
   */
  private parseJSONData(data: Record<string, unknown>): StreamChunk[] {
    const chunks: StreamChunk[] = [];

    // Формат 1: чанки с источниками (приходят в начале)
    // {"chunks": [{"text": "...", "source": "...", "score": 0.95}]}
    if ('chunks' in data && Array.isArray(data.chunks)) {
      this.pendingChunks = data.chunks as BackendChunk[];
      chunks.push({
        type: 'chunks',
        chunks: this.pendingChunks,
      });
      
      // Также добавляем текст из чанков для немедленного отображения
      const chunksText = this.pendingChunks.map(c => c.text).join('\n\n');
      if (chunksText) {
        chunks.push({ type: 'text', content: chunksText });
      }
      return chunks;
    }

    // Формат 2: текстовый токен
    // {"token": "..."}
    if ('token' in data && typeof data.token === 'string') {
      chunks.push({ type: 'text', content: data.token });
      return chunks;
    }

    // Формат 3: ID сообщения при завершении
    // {"message_id": 123}
    if ('message_id' in data && typeof data.message_id === 'number') {
      chunks.push({ type: 'done', messageId: data.message_id });
      return chunks;
    }

    // Формат 4: сигнал завершения
    if (data.done === true) {
      chunks.push({ type: 'done' });
      return chunks;
    }

    // Формат 5: ошибка
    if (typeof data.error === 'string') {
      chunks.push({ type: 'error', error: data.error });
      return chunks;
    }

    // Формат 6: цитата
    if (data.citation !== null && typeof data.citation === 'object') {
      chunks.push({
        type: 'citation',
        citation: data.citation as StreamChunk['citation'],
      });
      return chunks;
    }

    // Формат 7: метаданные
    if (data.type === 'metadata') {
      chunks.push({
        type: 'metadata',
        metadata: data.metadata as StreamChunk['metadata'],
      });
      return chunks;
    }

    // Попытка извлечь текст из различных полей
    const content = this.extractTextContent(data);
    if (content) {
      chunks.push({ type: 'text', content });
      return chunks;
    }

    // fallback: преобразуем в строку
    return [{ type: 'text', content: String(data) }];
  }

  /**
   * Извлечение текстового контента из различных форматов
   */
  private extractTextContent(data: Record<string, unknown>): string | undefined {
    // Стандартные поля
    if (typeof data.content === 'string') return data.content;
    if (typeof data.text === 'string') return data.text;
    if (typeof data.delta === 'string') return data.delta;
    
    // OpenAI-like формат
    if (data.choices && Array.isArray(data.choices) && data.choices[0]) {
      const choice = data.choices[0] as Record<string, unknown>;
      if (choice.delta && typeof choice.delta === 'object') {
        const delta = choice.delta as Record<string, unknown>;
        if (typeof delta.content === 'string') return delta.content;
      }
      if (typeof choice.text === 'string') return choice.text;
    }
    
    // Другие форматы
    if (typeof data.response === 'string') return data.response;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.value === 'string') return data.value;
    
    return undefined;
  }

  /**
   * Проверка валидности данных
   */
  private isValidStreamData(data: unknown): data is Record<string, unknown> {
    return typeof data === 'object' && data !== null;
  }

  /**
   * Получение накопленных чанков с источниками
   */
  getPendingChunks(): BackendChunk[] {
    const chunks = [...this.pendingChunks];
    this.pendingChunks = [];
    return chunks;
  }

  /**
   * Проверка, есть ли накопленные чанки
   */
  hasPendingChunks(): boolean {
    return this.pendingChunks.length > 0;
  }

  /**
   * Сброс состояния парсера
   */
  reset(): void {
    this.buffer = '';
    this.pendingChunks = [];
  }

  /**
   * Получение текущего буфера
   */
  getBuffer(): string {
    return this.buffer;
  }

  /**
   * Проверка, есть ли незавершенные данные в буфере
   */
  hasBuffer(): boolean {
    return this.buffer.length > 0;
  }
}

/**
 * Утилитарная функция для парсинга потоковых данных
 * @param reader - ReadableStreamReader
 * @param onChunk - колбэк на каждый чанк
 * @param onDone - колбэк при завершении
 * @param onError - колбэк при ошибке
 */
export async function parseStreamResponse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (chunk: StreamChunk) => void,
  onDone?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  const decoder = new TextDecoder();
  const parser = new StreamParser();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // Обрабатываем остаток в буфере
        if (buffer.trim()) {
          const chunks = parser.parse(buffer);
          chunks.forEach(onChunk);
        }
        onDone?.();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      
      // Пробуем распарсить SSE сообщения
      const sseMessages = buffer.split('\n\n');
      buffer = sseMessages.pop() || '';

      for (const sseMessage of sseMessages) {
        if (sseMessage.trim()) {
          const chunks = parser.parseSSE(sseMessage);
          chunks.forEach(onChunk);
        }
      }
    }
  } catch (error) {
    onError?.(error instanceof Error ? error : new Error(String(error)));
  } finally {
    reader.releaseLock();
    parser.reset();
  }
}

/**
 * Утилитарная функция для парсинга текстового потока
 * @param stream - ReadableStream
 * @param onToken - колбэк на каждый токен
 */
export async function parseTextStream(
  stream: ReadableStream<Uint8Array>,
  onToken: (token: string) => void
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const parser = new StreamParser();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      const chunks = parser.parse(text);
      
      for (const chunk of chunks) {
        if (chunk.type === 'text' && chunk.content) {
          onToken(chunk.content);
        } else if (chunk.type === 'chunks') {
          // Для чанков с источниками тоже извлекаем текст
          const chunksText = chunk.chunks?.map(c => c.text).join('\n\n');
          if (chunksText) onToken(chunksText);
        }
      }
    }
  } finally {
    reader.releaseLock();
    parser.reset();
  }
}