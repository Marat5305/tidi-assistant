// src/components/chat/MessageList.tsx
import { useRef, useEffect, useState } from 'react';
import { MessageItem } from './MessageItem';
import { MessageFeedback } from './MessageFeedback';
import { CitationsPanel } from './CitationsPanel';
import { useChatStore } from '../../store/chatStore';

export function MessageList() {
  const { messages, isMasterMode } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [activeCitationId, setActiveCitationId] = useState<string | null>(null);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
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