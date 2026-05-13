// src/App.tsx
import { ThreadSidebar } from './components/chat/ThreadSidebar';
import { ChatContainer } from './components/chat/ChatContainer';

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      <ThreadSidebar />
      <ChatContainer />
    </div>
  );
}

export default App;