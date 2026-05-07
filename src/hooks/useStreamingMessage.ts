// src/hooks/useStreamingMessage.ts
import { useCallback, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUIStore } from '../store/uiStore';
import { streamChat } from '../services/api';
import { StreamParser } from '../services/streamParser';
import type { Message, ChatRequest, Citation } from '../types/chat';
import { generateId } from '../utils/id';

export function useStreamingMessage() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamParserRef = useRef<StreamParser>(new StreamParser());

  const addMessage = useChatStore((state) => state.addMessage);
  const appendToStreamingMessage = useChatStore(
    (state) => state.appendToStreamingMessage
  );
  const finalizeStreamingMessage = useChatStore(
    (state) => state.finalizeStreamingMessage
  );
  const setStreaming = useChatStore((state) => state.setStreaming);
  const setCitations = useChatStore((state) => state.setCitations);
  const setError = useChatStore((state) => state.setError);
  const activeThreadId = useChatStore((state) => state.activeThreadId);
  const messages = useChatStore((state) => state.messages);
  const isStreaming = useChatStore((state) => state.isStreaming);

  const setLoading = useUIStore((state) => state.setLoading);

  const createAssistantMessage = (
    threadId: string,
    content: string,
    citations: Citation[]
  ): Message => ({
    id: generateId(),
    threadId,
    role: 'assistant',
    content,
    citations: citations.length > 0 ? citations : undefined,
    timestamp: Date.now(),
    status: 'sent',
  });

  const createUserMessage = (
    threadId: string,
    content: string
  ): Message => ({
    id: generateId(),
    threadId,
    role: 'user',
    content,
    timestamp: Date.now(),
    status: 'sent',
  });

  const sendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      const threadId = activeThreadId;

      if (!threadId || content.trim().length === 0) {
        return;
      }

      const userMessage = createUserMessage(threadId, content);
      addMessage(userMessage);

      setStreaming(true);
      setLoading(true);
      setError(null);

      streamParserRef.current.reset();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const chatRequest: ChatRequest = {
        threadId,
        message: content,
        attachments,
        contextMessages: messages.slice(-10).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        options: {
          temperature: 0.7,
          maxTokens: 4096,
        },
      };

      let streamedContent = '';
      const collectedCitations: Citation[] = [];

      try {
        for await (const chunk of streamChat(chatRequest, abortController.signal)) {
          const parsedChunks = streamParserRef.current.parse(chunk);

          for (const parsed of parsedChunks) {
            switch (parsed.type) {
              case 'text': {
                if (parsed.content) {
                  streamedContent += parsed.content;
                  appendToStreamingMessage(parsed.content);
                }
                break;
              }

              case 'citation': {
                if (parsed.citation) {
                  collectedCitations.push(parsed.citation);
                }
                break;
              }

              case 'error': {
                throw new Error(parsed.error ?? 'Unknown stream error');
              }

              case 'done': {
                const assistantMessage = createAssistantMessage(
                  threadId,
                  streamedContent,
                  collectedCitations
                );
                finalizeStreamingMessage(assistantMessage);

                if (collectedCitations.length > 0) {
                  setCitations(collectedCitations);
                }
                break;
              }

              case 'metadata': {
                // Handle metadata if needed
                break;
              }
            }
          }
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          if (streamedContent.length > 0) {
            const assistantMessage = createAssistantMessage(
              threadId,
              `${streamedContent}\n\n[Message generation was stopped]`,
              collectedCitations
            );
            finalizeStreamingMessage(assistantMessage);
          }
        } else {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to send message';
          setError(errorMessage);
          setStreaming(false);
        }
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [
      activeThreadId,
      messages,
      addMessage,
      appendToStreamingMessage,
      finalizeStreamingMessage,
      setStreaming,
      setCitations,
      setError,
      setLoading,
    ]
  );

  const stopStreaming = useCallback(() => {
    const controller = abortControllerRef.current;
    if (controller) {
      controller.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    sendMessage,
    stopStreaming,
    isStreaming,
  };
}