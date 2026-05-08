// src/components/chat/ChatContainer.tsx
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';

export function ChatContainer() {
  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <MessageList />
      <InputArea />
    </div>
  );
}