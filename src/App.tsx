// src/App.tsx
import { ThreadSidebar } from './components/chat/ThreadSidebar';
import { ChatContainer } from './components/chat/ChatContainer';
import { AgentSidebar } from './components/chat/AgentSidebar';

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      <ThreadSidebar />
      <ChatContainer />
      <AgentSidebar />
    </div>
  );
}

export default App;