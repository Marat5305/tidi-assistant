// src/components/chat/MessageItem.tsx
import type { Message } from '../../types/chat';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[70%] rounded-lg px-4 py-2
          ${isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
          }
        `}
      >
        {message.content}
      </div>
    </div>
  );
}