// src/hooks/useStreamingMessage.ts
import { useCallback, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { apiClient } from '../services/api';
import { StreamParser } from '../services/streamParser';
import type { 
  StreamChunk, 
  Citation, 
  Message,
  BackendChunk,
  // BackendMessage
} from '../types/chat';
import { 
  convertBackendChunkToCitation,
  createOptimisticUserMessage,
  createStreamingAssistantMessage 
} from '../types/chat';
// import { generateId } from '../utils/id';

export function useStreamingMessage() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamParserRef = useRef<StreamParser>(new StreamParser());

  // Селекторы из store
  const addMessage = useChatStore((state) => state.addMessage);
  const updateStreamingMessage = useChatStore((state) => state.updateStreamingMessage); 
  const finalizeStreamingMessage = useChatStore((state) => state.finalizeStreamingMessage);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const setCitations = useChatStore((state) => state.setCitations);
  const setError = useChatStore((state) => state.setError);
  const activeThreadId = useChatStore((state) => state.activeThreadId);
  // const streamingMessageId = useChatStore((state) => state.streamingMessageId);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const setLoading = useUIStore((state) => state.setLoading);

  /**
   * Конвертирует BackendChunk в Citation
   */
  const convertChunksToCitations = useCallback((chunks: BackendChunk[]): Citation[] => {
    return chunks.map((chunk, index) => convertBackendChunkToCitation(chunk, index));
  }, []);

  /**
   * Создает сообщение пользователя
   */
  const createUserMessage = useCallback((
    threadId: string,
    content: string
  ): Message => {
    return createOptimisticUserMessage(threadId, content);
  }, []);

  /**
   * Отправка сообщения
   */
  const sendMessage = useCallback(
    async (content: string) => {
      const threadId = activeThreadId;
      
      if (!threadId) {
        console.error('No active thread');
        setError('Нет активного чата');
        return;
      }

      // Преобразуем threadId (string) в sessionId (number)
      const sessionId = parseInt(threadId, 10);
      
      if (isNaN(sessionId)) {
        console.error('Invalid session ID');
        setError('Неверный ID сессии');
        return;
      }

      if (content.trim().length === 0) {
        console.error('Empty message');
        return;
      }

      // Создаем и добавляем сообщение пользователя
      const userMessage = createUserMessage(threadId, content);
      addMessage(userMessage);

      // Создаем стриминговое сообщение ассистента
      const streamingMessage = createStreamingAssistantMessage(threadId);
      addMessage(streamingMessage);

      // Обновляем состояние
      setStreaming(true);
      setLoading(true);
      setError(null);
      setCitations([]);

      // Сбрасываем парсер и создаем новый AbortController
      streamParserRef.current.reset();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Переменные для накопления данных
      let streamedContent = '';
      const collectedCitations: Citation[] = [];
      let finalMessageId: number | undefined;

      try {
        // Вызываем API с потоковой передачей
        await apiClient.streamChat(
          sessionId,
          content,
          (chunk: StreamChunk) => {
            switch (chunk.type) {
              case 'text': {
                if (chunk.content) {
                  streamedContent += chunk.content;
                  // Обновляем стриминговое сообщение
                  updateStreamingMessage(streamingMessage.id, streamedContent);
                }
                break;
              }

              case 'chunks': {
                if (chunk.chunks && chunk.chunks.length > 0) {
                  // Конвертируем чанки в цитаты
                  const citations = convertChunksToCitations(chunk.chunks);
                  collectedCitations.push(...citations);
                  setCitations(collectedCitations);
                  
                  // Добавляем информацию об источниках в стриминг
                  const sourcesText = `\n\n📚 **Источники:**\n${chunk.chunks.map(c => `- ${c.source}`).join('\n')}`;
                  streamedContent += sourcesText;
                  updateStreamingMessage(streamingMessage.id, streamedContent);
                }
                break;
              }

              case 'error': {
                throw new Error(chunk.error || 'Unknown stream error');
              }

              case 'done': {
                if (chunk.messageId) {
                  finalMessageId = chunk.messageId;
                }
                
                // Финальное сообщение с цитатами
                const finalMessage: Message = {
                  ...streamingMessage,
                  id: finalMessageId ? String(finalMessageId) : streamingMessage.id,
                  content: streamedContent,
                  citations: collectedCitations.length > 0 ? collectedCitations : undefined,
                  status: 'sent',
                  backendId: finalMessageId,
                };
                
                finalizeStreamingMessage(finalMessage);
                break;
              }
            }
          },
          abortController.signal
        );
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          // Пользователь остановил генерацию
          if (streamedContent.length > 0) {
            const finalMessage: Message = {
              ...streamingMessage,
              content: `${streamedContent}\n\n_[Генерация сообщения была остановлена пользователем]_`,
              citations: collectedCitations.length > 0 ? collectedCitations : undefined,
              status: 'sent',
            };
            finalizeStreamingMessage(finalMessage);
          } else {
            // Если ничего не было сгенерировано, удаляем стриминговое сообщение
            finalizeStreamingMessage(null);
          }
        } else {
          // Обработка ошибки
          const errorMessage = error instanceof Error ? error.message : 'Не удалось отправить сообщение';
          setError(errorMessage);
          
          // Обновляем сообщение с ошибкой
          const errorMessageText = `❌ **Ошибка:** ${errorMessage}`;
          const finalMessage: Message = {
            ...streamingMessage,
            content: streamedContent ? `${streamedContent}\n\n${errorMessageText}` : errorMessageText,
            status: 'error',
          };
          finalizeStreamingMessage(finalMessage);
        }
      } finally {
        setLoading(false);
        setStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [
      activeThreadId,
      addMessage,
      updateStreamingMessage,
      finalizeStreamingMessage,
      setStreaming,
      setCitations,
      setError,
      setLoading,
      createUserMessage,
      convertChunksToCitations,
    ]
  );

  /**
   * Остановка генерации ответа
   */
  const stopStreaming = useCallback(() => {
    const controller = abortControllerRef.current;
    if (controller) {
      controller.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Очистка состояния (при смене треда)
   */
  const resetStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    streamParserRef.current.reset();
    setStreaming(false);
    setLoading(false);
    setError(null);
  }, [setStreaming, setLoading, setError]);

  return {
    sendMessage,
    stopStreaming,
    resetStreaming,
    isStreaming,
  };
}