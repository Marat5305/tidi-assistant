// src/components/chat/InputArea.tsx
import { useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { ArrowUp } from 'lucide-react';

export function InputArea() {
  const [input, setInput] = useState('');
  const { sendMessage } = useChatStore();
  
  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="border-t border-[var(--color-accent)] p-4 bg-white dark:bg-gray-800">
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение... (Enter — отправить)"
          className="flex-1 resize-none rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          rows={2}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-white hover:bg-[var(--color-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          aria-label="Отправить сообщение"
        >
          <ArrowUp size={20} />
        </button>
      </div>
    </div>
  );
}