// src/components/chat/ThreadSidebar.tsx
import { useState, useEffect, useCallback } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useUIStore } from '../../store/uiStore';
import { Menu, PanelLeftClose, Search, Plus, Trash2, Loader2 } from 'lucide-react';
import { groupThreadsByDate } from '../../utils/threadGrouping';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { apiClient } from '../../services/api';
import type { BackendSession, Thread } from '../../types/chat';
import { convertBackendSessionToThread } from '../../types/chat';
import logo from '../../assets/logo.svg';

export function ThreadSidebar() {
  const sidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  
  // Получаем данные из store
  const threads = useChatStore((state) => state.threads);
  const activeThreadId = useChatStore((state) => state.activeThreadId);
  const setThreads = useChatStore((state) => state.setThreads);
  const addThread = useChatStore((state) => state.addThread);
  const setActiveThread = useChatStore((state) => state.setActiveThread);
  const deleteThread = useChatStore((state) => state.deleteThread);
  const clearMessages = useChatStore((state) => state.clearMessages);

  // Состояние для модалки удаления
  const [threadToDelete, setThreadToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  // Загрузка тредов с бэкенда
  const loadThreads = useCallback(async () => {
    if (isInitialLoaded) return;
    
    try {
      setIsLoading(true);
      const sessions = await apiClient.getSessions();
      
      // Конвертируем бэкенд-сессии в треды
      const loadedThreads: Thread[] = sessions.map((session: BackendSession) => 
        convertBackendSessionToThread(session)
      );
      
      setThreads(loadedThreads);
      
      // Если есть активный тред, но его нет в списке, сбрасываем активный
      if (activeThreadId && !loadedThreads.find(t => t.id === activeThreadId)) {
        setActiveThread(null);
      }
      
      setIsInitialLoaded(true);
    } catch (error) {
      console.error('Failed to load threads:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setThreads, activeThreadId, setActiveThread, isInitialLoaded]);

  // Загрузка при монтировании через флаг
  useEffect(() => {
    let mounted = true;
    
    const initLoad = async () => {
      if (mounted && !isInitialLoaded) {
        await loadThreads();
      }
    };
    
    initLoad();
    
    return () => {
      mounted = false;
    };
  }, [loadThreads, isInitialLoaded]);

  // Обработчик создания нового чата
  const handleNewChat = useCallback(async () => {
    try {
      setIsCreating(true);
      
      // Создаем новую сессию на бэкенде
      const newSession = await apiClient.createSession();
      
      // Конвертируем в тред
      const newThread = convertBackendSessionToThread(newSession);
      
      // Добавляем в store
      addThread(newThread);
      
      // Активируем новый тред
      setActiveThread(newThread.id);
      
      // Очищаем сообщения (новый чат пустой)
      clearMessages();
    } catch (error) {
      console.error('Failed to create thread:', error);
    } finally {
      setIsCreating(false);
    }
  }, [addThread, setActiveThread, clearMessages]);

  // Обработчик удаления чата
  const handleDeleteThread = useCallback(async (threadId: string) => {
    try {
      const sessionId = parseInt(threadId, 10);
      if (!isNaN(sessionId)) {
        await apiClient.deleteSession(sessionId);
      }
      
      // Удаляем из store
      deleteThread(threadId);
      
      // Закрываем модалку
      setThreadToDelete(null);
    } catch (error) {
      console.error('Failed to delete thread:', error);
    }
  }, [deleteThread]);

  // Обработчик открытия модалки удаления
  const handleDeleteClick = (e: React.MouseEvent, threadId: string, threadTitle: string) => {
    e.stopPropagation(); // Останавливаем всплытие, чтобы не сработал onClick родителя
    setThreadToDelete({ id: threadId, title: threadTitle });
  };

  // Обработчик подтверждения удаления
  const handleConfirmDelete = () => {
    if (threadToDelete) {
      handleDeleteThread(threadToDelete.id);
    }
  };

  // Обработчик закрытия модалки (без удаления)
  const handleCloseDialog = () => {
    setThreadToDelete(null);
  };

  // Фильтрация тредов по поиску
  const filteredThreads = searchQuery.trim()
    ? threads.filter(thread => 
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (thread.lastMessage && thread.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : threads;

  // Группируем треды по датам (с учетом фильтрации)
  const threadGroups = groupThreadsByDate(filteredThreads);

  return (
    <>
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
                  {/* Кнопка поиска с индикатором загрузки */}
                  <div className="relative">
                    {showSearch ? (
                      <div className="absolute right-0 top-0 z-10">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onBlur={() => {
                            if (!searchQuery) setShowSearch(false);
                          }}
                          placeholder="Поиск..."
                          className="w-40 px-2 py-1 text-sm rounded-md border border-[var(--color-accent)] bg-[var(--color-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSearch(true)}
                        className="p-1.5 rounded-md text-gray-500 hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
                        aria-label="Поиск по истории"
                      >
                        <Search size={18} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-md text-gray-500 hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
                    aria-label="Свернуть сайдбар"
                  >
                    <PanelLeftClose size={18} />
                  </button>
                </div>
              </div>

              {/* Кнопка нового чата с индикатором загрузки */}
              <button
                onClick={handleNewChat}
                disabled={isCreating}
                className="w-full mb-4 px-3 py-2 flex items-center justify-center gap-2 text-sm rounded-lg shadow-sm border border-gray-200 text-gray-500 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Новый чат
                  </>
                )}
              </button>

              {/* Список тредов с группировкой */}
              <div className="flex-1 overflow-y-auto thin-scrollbar">
                {isLoading && threads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-center text-gray-400 text-sm py-8">
                    <Loader2 size={24} className="animate-spin" />
                    Загрузка чатов...
                  </div>
                ) : threadGroups.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">
                    {searchQuery ? (
                      <>
                        Ничего не найдено
                        <br />
                        <button
                          onClick={() => setSearchQuery('')}
                          className="mt-2 text-[var(--color-accent)] hover:underline"
                        >
                          Очистить поиск
                        </button>
                      </>
                    ) : (
                      <>
                        Нет чатов
                        <br />
                        Нажмите "Новый чат"
                      </>
                    )}
                  </div>
                ) : (
                  threadGroups.map((group) => (
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
                              group relative px-3 py-2 rounded-lg cursor-pointer transition-all
                              ${activeThreadId === thread.id 
                                ? 'bg-[var(--color-accent)]/15 dark:bg-blue-900/50' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between gap-2">
                              {/* Контент треда */}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {thread.title}
                                </div>
                                {thread.lastMessage && (
                                  <div className="text-xs text-gray-500 truncate mt-0.5">
                                    {thread.lastMessage}
                                  </div>
                                )}
                              </div>
                              
                              {/* Кнопка удаления - появляется при наведении на тред */}
                              <button
                                onClick={(e) => handleDeleteClick(e, thread.id, thread.title)}
                                className={`
                                  opacity-0 group-hover:opacity-100 transition-opacity
                                  p-1 rounded-md text-gray-400 hover:text-red-500 
                                  hover:bg-red-50 dark:hover:bg-red-900/20
                                  flex-shrink-0
                                `}
                                aria-label="Удалить чат"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
    {/* Модалка подтверждения удаления */}
      <ConfirmDialog
        isOpen={threadToDelete !== null}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="Удалить чат?"
        description={`Вы уверены, что хотите удалить чат "${threadToDelete?.title}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        confirmVariant="danger"
      />
      </>
  );
}