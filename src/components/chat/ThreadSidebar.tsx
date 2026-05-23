// src/components/chat/ThreadSidebar.tsx
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import { Menu, PanelLeftClose, Search, Plus } from 'lucide-react';
import { groupThreadsByDate } from '../../utils/threadGrouping';
import logo from '../../assets/logo.svg';

export function ThreadSidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  
  // Получаем данные из store
  const threads = useChatStore((state) => state.threads);
  const activeThreadId = useChatStore((state) => state.activeThreadId);
  const createThread = useChatStore((state) => state.createThread);
  const setActiveThread = useChatStore((state) => state.setActiveThread);

  // Группируем треды по датам
  const threadGroups = groupThreadsByDate(threads);

  // Обработчик создания нового чата
  const handleNewChat = () => {
    createThread();
  };

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
              {/* Верхняя панель с логотипом и кнопками */}
              <div className="flex justify-between items-end mb-4">
                <div className="flex gap-1 items-end">
                  <img src={logo} alt="Логотип" className="h-8 w-auto" />
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

              {/* Кнопка нового чата */}
              <button
                onClick={handleNewChat}
                className="w-full mb-4 px-3 py-2 flex items-center gap-2 text-sm rounded-lg shadow-sm border border-gray-200 text-gray-500 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:shadow-md transition-all"
              >
                <Plus size={16} />
                Новый чат
              </button>

              {/* Список тредов с группировкой */}
              <div className="flex-1 overflow-y-auto thin-scrollbar">
                {threadGroups.map((group) => (
                  <div key={group.title} className="mb-4">
                    {/* Заголовок группы */}
                    <p className="text-xs font-semibold text-gray-400 mb-2">{group.title}</p>
                    
                    {/* Список тредов в группе */}
                    <div className="space-y-1">
                      {group.threads.map((thread) => (
                        <div
                          key={thread.id}
                          onClick={() => setActiveThread(thread.id)}
                          className={`
                            px-3 py-2 rounded-lg cursor-pointer transition-colors
                            ${activeThreadId === thread.id 
                              ? 'bg-[var(--color-accent)]/15 dark:bg-blue-900/50' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          <div className="text-sm font-medium truncate">
                            {thread.title}
                          </div>
                          {thread.lastMessage && (
                            <div className="text-xs text-gray-500 truncate mt-0.5">
                              {thread.lastMessage}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Если нет тредов, показываем подсказку */}
                {threads.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">
                    Нет чатов
                    <br />
                    Нажмите "Новый чат"
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}