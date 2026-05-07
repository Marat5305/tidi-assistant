// src/services/api.ts
import type { Thread, ChatRequest } from '../types/chat';

const DEFAULT_API_URL = 'http://localhost:3001/api';

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

  async getThreads(): Promise<Thread[]> {
    const response = await fetch(`${this.baseUrl}/threads`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Thread[]>(response);
  }

  async getThread(threadId: string): Promise<Thread> {
    const response = await fetch(`${this.baseUrl}/threads/${threadId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse<Thread>(response);
  }

  async deleteThread(threadId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/threads/${threadId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    await this.handleResponse<void>(response);
  }

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
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText) as {
              fileId: string;
              url: string;
            };
            resolve(response);
          } catch {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new DOMException('Upload aborted', 'AbortError'));
      });

      const token =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('auth_token')
          : null;
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.open('POST', `${this.baseUrl}/upload`);
      xhr.send(formData);
    });
  }
}

export const apiClient = new ApiClient();

async function* streamChatGenerator(
  chatRequest: ChatRequest,
  signal?: AbortSignal
): AsyncGenerator<string, void, undefined> {
  const url = `${import.meta.env.VITE_API_URL ?? DEFAULT_API_URL}/chat/stream`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(chatRequest),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.message ?? `HTTP ${response.status}`;
    throw new Error(message);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('ReadableStream not supported in this environment');
  }

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      yield decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

export { streamChatGenerator as streamChat };