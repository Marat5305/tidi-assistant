// src/services/api.ts
import type { Thread, ChatRequest, StreamChunk, Citation, BackendSession, BackendMessage } from '../types/chat';

const DEFAULT_API_URL = 'http://localhost:3001/api';

// ============= API Клиент =============

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message = errorBody?.message ?? `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(message);
    }

    return response.json() as Promise<T>;
  }

  // ============= Сессии (Chats) - соответствие вашему CRUD =============

  /**
   * POST /sessions - создание новой сессии
   */
  async createSession(title?: string): Promise<BackendSession> {
    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title: title || '' }),
    });
    return this.handleResponse<BackendSession>(response);
  }

  /**
   * GET /sessions - получение списка сессий
   */
  async getSessions(): Promise<BackendSession[]> {
    const response = await fetch(`${this.baseUrl}/sessions`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<BackendSession[]>(response);
  }

  /**
   * GET /sessions/{session_id}/messages - получение сообщений сессии
   */
  async getMessages(sessionId: number): Promise<BackendMessage[]> {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/messages`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<BackendMessage[]>(response);
  }

  /**
   * PATCH /sessions/{session_id} - переименование сессии
   */
  async renameSession(sessionId: number, title: string): Promise<BackendSession> {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ title }),
    });
    return this.handleResponse<BackendSession>(response);
  }

  /**
   * DELETE /sessions/{session_id} - удаление сессии
   */
  async deleteSession(sessionId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    await this.handleResponse<void>(response);
  }

  /**
   * GET /sessions/{session_id}/reset - сброс истории (очистка кэша на бэкенде)
   */
  async resetSession(sessionId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/reset`, {
      headers: this.getHeaders(),
    });
    await this.handleResponse<void>(response);
  }

  // ============= Чат с потоковой передачей =============

  /**
   * POST /sessions/{session_id}/chat - потоковый чат (SSE)
   */
  async streamChat(
    sessionId: number,
    message: string,
    onChunk: (chunk: StreamChunk) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const url = `${this.baseUrl}/sessions/${sessionId}/chat`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message }),
      signal,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody?.message ?? `HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('ReadableStream not supported');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Парсим SSE сообщения (data: {...}\n\n)
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              
              if (dataStr === '[DONE]') {
                onChunk({ type: 'done' });
                continue;
              }
              
              try {
                const json = JSON.parse(dataStr);
                
                // Формат ответа от вашего бэкенда:
                // {"chunks": [...]} - источники
                // {"token": "..."} - текст
                // {"message_id": 123} - ID сохраненного сообщения
                
                if (json.chunks) {
                  onChunk({ 
                    type: 'chunks', 
                    chunks: json.chunks.map((c: { text: string; source: string; score: number }) => ({
                      text: c.text,
                      source: c.source,
                      score: c.score,
                    }))
                  });
                }
                
                if (json.token) {
                  onChunk({ type: 'text', content: json.token });
                }
                
                if (json.message_id) {
                  onChunk({ type: 'done', messageId: json.message_id });
                }
              } catch {
                // Игнорируем некорректный JSON
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // ============= Совместимость с Thread API (для существующего кода) =============

  async getThreads(): Promise<Thread[]> {
    const sessions = await this.getSessions();
    return sessions.map(session => ({
      id: String(session.id),
      title: session.title || 'Новый чат',
      messages: [],
      createdAt: new Date(session.created_at).getTime(),
      updatedAt: new Date(session.updated_at).getTime(),
    }));
  }

  async getThread(threadId: string): Promise<Thread> {
    const sessionId = parseInt(threadId, 10);
    const [session, messages] = await Promise.all([
      this.getSessions().then(sessions => sessions.find(s => s.id === sessionId)),
      this.getMessages(sessionId),
    ]);
    
    if (!session) throw new Error('Thread not found');
    
    return {
      id: String(session.id),
      title: session.title || 'Новый чат',
      messages: messages.map(msg => ({
        id: String(msg.id),
        threadId: threadId,
        role: msg.role,
        content: msg.content,
        citations: msg.sources?.map(s => ({ text: s, source: s, relevanceScore: 1 } as Citation)),
        timestamp: new Date(msg.created_at).getTime(),
        status: 'sent',
      })),
      createdAt: new Date(session.created_at).getTime(),
      updatedAt: new Date(session.updated_at).getTime(),
    };
  }

  async deleteThread(threadId: string): Promise<void> {
    return this.deleteSession(parseInt(threadId, 10));
  }

  // ============= Загрузка файлов =============

  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ fileId: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Network error')));
      xhr.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));

      const token = localStorage.getItem('auth_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.open('POST', `${this.baseUrl}/upload`);
      xhr.send(formData);
    });
  }
}

export const apiClient = new ApiClient();

// ============= Совместимость со старым streamChat =============

/**
 * @deprecated Используйте apiClient.streamChat
 */
export async function* streamChat(
  chatRequest: ChatRequest,
  signal?: AbortSignal
): AsyncGenerator<string, void, undefined> {
  const sessionId = parseInt(chatRequest.threadId, 10);
  
  const url = `${DEFAULT_API_URL}/sessions/${sessionId}/chat`;
  
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message: chatRequest.message }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('ReadableStream not supported');

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}