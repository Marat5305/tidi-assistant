// src/components/chat/ThreadSidebar.tsx
import { useUIStore } from '../../store/uiStore';
import { Menu, ArrowLeft } from 'lucide-react';

export function ThreadSidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  
  // Если сайдбар НЕ открыт - показываем кнопку
  if (!sidebarOpen) {
    return (
      <div className="p-2">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors"
          aria-label="Открыть историю"
        >
          <Menu size={20} />
        </button>
      </div>
    );
  }
  
  return (
    <aside className="w-64 border-r border-[var(--color-accent)] bg-[var(--color-surface)] p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">История</h2>
        <button 
          onClick={toggleSidebar} 
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Свернуть сайдбар"
        >
          <ArrowLeft size={20} />
        </button>
      </div>
      
      <div className="text-sm text-gray-500">
        <p>📁 Сегодня</p>
        <p className="mt-2 p-2 bg-blue-100 dark:bg-blue-900 rounded">
          Текущий диалог
        </p>
        <p className="mt-1 p-2">Предыдущий чат</p>
      </div>
    </aside>
  );
}