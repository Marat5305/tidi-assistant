//src/components/chat/MessageFeedback.tsx
import * as Tooltip from '@radix-ui/react-tooltip';
import { ThumbsUp, ThumbsDown, Share2 } from 'lucide-react';
import { useState } from 'react';

interface MessageFeedbackProps {
  messageId: string;
  messageContent: string;
}

export function MessageFeedback({ messageId, messageContent }: MessageFeedbackProps) {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = () => {
    if (isLoading) return;
    
    if (feedback === 'like') {
      // Отмена лайка
      setFeedback(null);
      console.log('Cancelled like for:', messageId);
    } else {
      // Ставим лайк (если был дизлайк - заменяем)
      setFeedback('like');
      setIsLoading(true);
      console.log('Like for:', messageId, messageContent);
      // Имитация отправки
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const handleDislike = () => {
    if (isLoading) return;
    
    if (feedback === 'dislike') {
      // Отмена дизлайка
      setFeedback(null);
      console.log('Cancelled dislike for:', messageId);
    } else {
      // Ставим дизлайк (если был лайк - заменяем)
      setFeedback('dislike');
      setIsLoading(true);
      console.log('Dislike for:', messageId, messageContent);
      // Имитация отправки
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 ms-4">
      {/* Лайк */}
      <Tooltip.Provider>
        <Tooltip.Root delayDuration={200}>
          <Tooltip.Trigger asChild>
            <button
              onClick={handleLike}
              disabled={isLoading}
              className={`p-1 rounded-md transition-all hover:scale-110 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="Полезный ответ"
            >
              <ThumbsUp 
                size={16} 
                className={`transition-colors ${
                  feedback === 'like' 
                    ? 'text-green-500' 
                    : 'text-gray-500'
                }`} 
              />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="px-2 py-1 text-xs bg-gray-900 text-white rounded-md"
              sideOffset={5}
            >
              Полезный ответ
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      {/* Дизлайк */}
      <Tooltip.Provider>
        <Tooltip.Root delayDuration={200}>
          <Tooltip.Trigger asChild>
            <button
              onClick={handleDislike}
              disabled={isLoading}
              className={`p-1 rounded-md transition-all hover:scale-110 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="Не помогло"
            >
              <ThumbsDown 
                size={16} 
                className={`transition-colors ${
                  feedback === 'dislike' 
                    ? 'text-red-500' 
                    : 'text-gray-500'
                }`} 
              />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="px-2 py-1 text-xs bg-gray-900 text-white rounded-md"
              sideOffset={5}
            >
              Не помогло
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      {/* Поделиться */}
      <Tooltip.Provider>
        <Tooltip.Root delayDuration={200}>
          <Tooltip.Trigger asChild>
            <button
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110"
              aria-label="Поделиться"
            >
              <Share2 size={16} className="text-gray-500 transition-colors" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="px-2 py-1 text-xs bg-gray-900 text-white rounded-md"
              sideOffset={5}
            >
              Скопировать ответ
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
}