import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import { useRef, useEffect, useState } from 'react';

export function ChatContainer() {
  const { messages, isMasterMode } = useChatStore();
  const { sidebarOpen } = useUIStore();
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Определяем высоту контейнера для центровки
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 mx-10"
    >
      {/* Список сообщений - показываем только в режиме чата */}
      {!isMasterMode && messages.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <MessageList />
        </div>
      )}
      
      {/* Контейнер с полем ввода */}
      <div 
        className={`
          w-full px-4 pb-6 transition-all duration-500 ease-out
          ${isMasterMode ? 'absolute left-0 right-0 mx-auto' : 'relative mt-auto'}
          ${isMasterMode ? 'max-w-2xl' : ''}
        `}
        style={{
          top: isMasterMode ? '50%' : 'auto',
          transform: isMasterMode ? 'translateY(-50%)' : 'none',
          marginLeft: 'auto',
          transition: 'all 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1)'
        }}
      >
        <InputArea />
      </div>
    </div>
  );
}