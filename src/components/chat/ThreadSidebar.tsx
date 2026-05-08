// src/components/chat/ThreadSidebar.tsx
import { useUIStore } from '../../store/uiStore';

export function ThreadSidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  
  if (!sidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed left-2 top-2 z-50 bg-blue-500 text-white p-2 rounded"
      >
        ☰
      </button>
    );
  }
  
  return (
    <aside className="w-64 border-r border-[var(--color-accent)] bg-[var(--color-surface)] p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">История</h2>
        <button onClick={toggleSidebar} className="text-gray-500">
          ✕
        </button>
      </div>
      
      <div className="text-sm text-gray-500">
        {/* Заглушка */}
        <p>📁 Сегодня</p>
        <p className="mt-2 p-2 bg-blue-100 dark:bg-blue-900 rounded">
          Текущий диалог
        </p>
        <p className="mt-1 p-2">Предыдущий чат</p>
      </div>
    </aside>
  );
}