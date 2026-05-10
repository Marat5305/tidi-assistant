//src/components/chat/MessageList.tsx
import { useRef, useEffect } from 'react';
import { MessageItem } from './MessageItem';
import { MessageFeedback } from './MessageFeedback';
import { useChatStore } from '../../store/chatStore';

export function MessageList() {
  const { messages, isMasterMode } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Авто-скролл к последнему сообщению
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message) => (
        <div key={message.id}>
          <MessageItem message={message} />
          {/* Показываем кнопки только для ассистента и не в мастер-режиме */}
          {!isMasterMode && message.role === 'assistant' && (
            <MessageFeedback 
              messageId={message.id} 
              messageContent={message.content} 
            />
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}