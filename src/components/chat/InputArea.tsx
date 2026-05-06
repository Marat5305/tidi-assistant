// src/components/chat/InputArea.tsx
import { useState } from 'react';
import { useChatStore } from '../../store/chatStore';

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
    <div className="border-t p-4 bg-white dark:bg-gray-800">
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение... (Enter — отправить)"
          className="flex-1 resize-none rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Отправить
        </button>
      </div>
    </div>
  );
}