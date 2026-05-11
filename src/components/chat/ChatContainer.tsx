import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { useChatStore } from '../../store/chatStore';
import { useRef} from 'react';

export function ChatContainer() {
  const { messages, isMasterMode } = useChatStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900 mx-10 relative"
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
          w-full px-4 pb-6 transition-all duration-500 ease-out
          ${isMasterMode 
            ? 'fixed inset-x-0 top-1/2 -translate-y-1/2 max-w-2xl mx-auto' 
            : 'relative mt-auto'
          }
        `}
        style={{
          transitionProperty: 'top, transform, margin-top', // только вертикаль
          transitionTimingFunction: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
        }}
      >
        <InputArea />
      </div>
    </div>
  );
}