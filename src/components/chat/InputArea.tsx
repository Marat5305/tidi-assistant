// src/components/chat/InputArea.tsx
import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { ArrowUp, Paperclip, Mic } from 'lucide-react';

export function InputArea() {
  const [input, setInput] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const { sendMessage, isMasterMode } = useChatStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Авто-изменение высоты textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Сбрасываем высоту, чтобы правильно вычислить scrollHeight
    textarea.style.height = 'auto';
    
    // Новая высота = min(содержимое, maxHeight)
    const maxHeight = 220; // максимальная высота в пикселях (примерно 5-6 строк)
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [input]);

  // Устанавливаем фокус при загрузке компонента
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);
  
  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
      
      // Сбрасываем высоту после отправки
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }, 0);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          {/* Анимированное свечение - только в мастер-режиме и когда поле пустое */}
          {isMasterMode && input.length === 0 && (
            <div 
              className={`
                absolute -inset-1.5 rounded-2xl transition-all duration-500
                ${!isHovered ? 'animate-pulse opacity-70' : 'opacity-100'}
              `}
              style={{
                background: 'linear-gradient(90deg, #0abab5, #158683, #0abab5, #158683)',
                backgroundSize: '300% 100%',
                filter: 'blur(8px)',
                animation: 'gradientFlow 3s ease infinite',
              }}
            />
          )}
          <div
            className="relative
            w-full flex items-start gap-4 bg-white rounded-2xl border-2 border-[var(--color-accent)]
            dark:bg-gray-800 px-4 py-2 transition-all
            z-10"
          >
            <button
              className="text-[var(--color-accent)] hover:text-[var(--color-hover)] transition-colors cursor-pointer flex-shrink-0 mt-2"
              aria-label="Прикрепить файл"
            >
              <Paperclip size={20} />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              placeholder="Напишите сообщение... (Enter — отправить)"
              className="flex-1 rounded-lg bg-white dark:bg-gray-700 p-2 resize-none overflow-y-auto focus:outline-none focus:ring-0"
              rows={1}
              style={{
                maxHeight: '220px',
                lineHeight: '1.5',
              }}
            />
              <button
                className="text-[var(--color-accent)] hover:text-[var(--color-hover)] transition-colors cursor-pointer flex-shrink-0 mt-2"
                aria-label="Голосовое сообщение"
              >
                <Mic size={20} />
              </button>
          </div>
        </div>
        
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-white hover:bg-[var(--color-hover)]
          disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:scale-105 self-end mb-3"
          aria-label="Отправить сообщение"
        >
          <ArrowUp size={20} />
        </button>
      </div>
    
    </div>
  );
}