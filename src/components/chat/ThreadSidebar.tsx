// src/components/chat/ThreadSidebar.tsx
import { useUIStore } from '../../store/uiStore';
import { Menu, PanelLeftClose, Search, Plus } from 'lucide-react';
import logo from '../../assets/logo.svg';

export function ThreadSidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <div className="relative flex h-full">
      {/* Кнопка открытия — видна только когда сайдбар закрыт */}
      {!sidebarOpen && (
        <div className="absolute left-0 top-2 z-10 p-2">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors"
            aria-label="Открыть историю"
          >
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* Обёртка с анимируемой шириной */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-out h-full
          ${sidebarOpen ? 'w-64 border-r border-[var(--color-accent)]' : 'w-0 border-r-0'}
        `}
      >
        {/* Внутренний контейнер фиксированной ширины — чтобы контент не схлопывался */}
        <div className="w-64 h-full">
          {sidebarOpen && (
            <aside className="bg-[var(--color-surface)] p-4 flex flex-col h-full">
              <div className="flex justify-between items-end mb-4">
                <div className="flex gap-1 items-end">
                  <img src={logo} alt="Логотип" className="fill-[var(--color-surface)] h-8 w-auto" />
                  <h2 className="text-2xl font-bold italic tracking-wide text-gradient-logo">тиди</h2>
                </div>
                <div className="flex items-end gap-1">
                  <button
                    className="p-1.5 rounded-md text-gray-500 hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
                    aria-label="Поиск по истории"
                  >
                    <Search size={18} />
                  </button>
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-md text-gray-500 hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
                    aria-label="Свернуть сайдбар"
                  >
                    <PanelLeftClose size={18} />
                  </button>
                </div>
              </div>

              <button className="w-full mb-4 px-3 py-2 flex items-center gap-2 text-sm rounded-lg shadow-sm border border-gray-200 text-gray-500 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:shadow-md transition-all">
                <Plus size={16} />
                Новый чат
              </button>

              <div className="text-sm text-gray-500">
                <p>Сегодня</p>
                <p className="mt-2 p-2 bg-[var(--color-accent)]/15 dark:bg-blue-900 rounded">
                  Текущий диалог
                </p>
                <p className="mt-1 p-2">Предыдущий чат</p>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}