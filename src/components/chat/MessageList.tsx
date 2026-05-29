// src/components/chat/MessageList.tsx
import { useRef, useEffect, useState } from 'react';
import { MessageItem } from './MessageItem';
import { MessageFeedback } from './MessageFeedback';
import { SuggestionButtons } from './SuggestionButtons';
import { CitationsPanel } from './CitationsPanel';
import { useChatStore } from '../../store/chatStore';
import { type SuggestionAction } from '../../types/chat';

export function MessageList() {
  const { messages, isMasterMode } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [activeCitationId, setActiveCitationId] = useState<string | null>(null);
  
  // Функция, возвращающая статичные подсказки для всех ассистентов
  const getDefaultSuggestions = (): SuggestionAction[] => {
    return [
      {
        id: 'suggestion-1',
        label: 'Разверни подробнее',
        prompt: 'Разверни, пожалуйста, этот ответ подробнее',
      },
      {
        id: 'suggestion-2',
        label: 'Сделай кратко',
        prompt: 'Можешь дать краткую выжимку этого ответа?',
      },
      {
        id: 'suggestion-3',
        label: 'Что ещё ты умеешь?',
        prompt: 'Расскажи, что ещё ты умеешь? Какие у тебя возможности?',
      },
    ];
  };

  // Обработчик клика по подсказке
  const handleSuggestionClick = (prompt: string) => {
  // Получаем функцию sendMessage из store
  const { sendMessage, isStreaming } = useChatStore.getState();
  
  // Не отправляем, если уже идёт стриминг
  if (isStreaming) {
    return;
  }
  
  // Отправляем сообщение
  sendMessage(prompt);
};
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex-1 overflow-y-auto py-4 px-6 space-y-3">
      {messages.map((message) => (
        <div key={message.id}>
          <MessageItem 
            message={message} 
            activeCitationId={activeCitationId}
            onCitationClick={setActiveCitationId}
          />
          {!isMasterMode && message.role === 'assistant' && (
            <>
              <MessageFeedback 
                messageId={message.id} 
                messageContent={message.content} 
              />
              {/* 👇 НОВЫЙ БЛОК КНОПОК-ПОДСКАЗОК */}
              <SuggestionButtons 
                suggestions={getDefaultSuggestions()}
                onSuggestionClick={handleSuggestionClick}
              />
              {message.citations && message.citations.length > 0 && (
                <CitationsPanel 
                  citations={message.citations}
                  activeCitationId={activeCitationId}
                  onCitationClick={setActiveCitationId}
                />
              )}
            </>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}