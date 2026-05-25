// src/components/chat/ChatContainer.tsx
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { useChatStore } from '../../store/chatStore';
import { useRef, useEffect, useState } from 'react';
import { FileDropZone } from './FileDropZone';

export function ChatContainer() {
  const { messages, isMasterMode } = useChatStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Реф на контейнер поля ввода — нужен, чтобы браузер не кэшировал начальный transform при первом рендере
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    // Маленькая задержка, чтобы DOM отрисовался до первой анимации
    requestAnimationFrame(() => setIsReady(true));
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 mx-auto relative w-[90%] max-w-[1200px]"
    >
      {/* Список сообщений - с плавным появлением/исчезновением */}
      <div 
        className={`
          flex-1 overflow-y-auto transition-all duration-500 ease-out
          ${isMasterMode ? 'opacity-0 invisible' : 'opacity-100 visible'}
        `}
        style={{
          transitionProperty: 'opacity, visibility',
        }}
      >
        {!isMasterMode && messages.length > 0 && <MessageList />}
      </div>
      
      {/* Контейнер с полем ввода */}
      <div 
        className={`
          w-full px-4 pb-6
          ${isMasterMode 
            ? 'max-w-2xl mx-auto mt-0' 
            : 'max-w-full mt-auto'
          }
        `}
        style={{
          transform: isReady
          ? (isMasterMode 
                ? 'translateY(calc(-50vh + 50%))' // поднимаем в центр экрана
                : 'translateY(0)')                 // на место внизу
            : 'translateY(0)',                     // начальное состояние без анимации
          transition: 'transform 500ms cubic-bezier(0.34, 1.2, 0.64, 1), max-width 500ms ease-out',
        }}
      >
        <FileDropZone>
          <InputArea />
        </FileDropZone>
      </div>
    </div>
  );
}