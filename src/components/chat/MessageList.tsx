// src/components/chat/MessageList.tsx
import { useRef, useEffect } from 'react';
import { MessageItem } from './MessageItem';
import { useChatStore } from '../../store/chatStore';

export function MessageList() {
  const { messages } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Авто-скролл к последнему сообщению
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}