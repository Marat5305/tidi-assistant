// src/components/chat/MessageFeedback.tsx
import * as Tooltip from '@radix-ui/react-tooltip';
import { ThumbsUp, ThumbsDown, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/DropdownMenu';

interface MessageFeedbackProps {
  messageId: string;
  messageContent: string;
}

export function MessageFeedback({ messageId, messageContent }: MessageFeedbackProps) {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  const [feedbackReason, setFeedbackReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Текст кастомной причины и флаг, открыто ли поле ввода
  const [customReasonText, setCustomReasonText] = useState<string | null>(null);

  // Отладка: логируем причину дизлайка при изменении
  useEffect(() => {
    if (feedbackReason) {
      console.log(`Feedback reason for ${messageId}: ${feedbackReason}`);
    }
  }, [feedbackReason, messageId]);

  // ---------- Лайк ----------
  const handleLike = () => {
    if (isLoading) return;

    if (feedback === 'like') {
      setFeedback(null);
      console.log('Cancelled like for:', messageId);
    } else {
      setFeedback('like');
      setFeedbackReason(null); // сбрасываем причину дизлайка, если была
      setIsLoading(true);
      console.log('Like for:', messageId, messageContent);
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  // ---------- Выбор причины дизлайка ----------
  const handleDislikeReason = (reason: string) => {
    setFeedback('dislike');
    setFeedbackReason(reason);
    setIsLoading(true);
    console.log('Dislike for:', messageId, messageContent, '| Reason:', reason);
    setTimeout(() => setIsLoading(false), 300);
  };

  // ---------- Снятие дизлайка (если кликнули на уже активный) ----------
  // Обработчик клика по кнопке дизлайка
  // Важно: Radix открывает меню на onPointerDown, поэтому preventDefault должен быть на onPointerDown
  const handleDislikeClick = (e: React.MouseEvent) => {
    if (isLoading) return;

    // Если дизлайк уже стоит — снимаем его и не даём меню открыться
    if (feedback === 'dislike') {
      e.preventDefault(); // предотвращает открытие меню
      setFeedback(null);
      setFeedbackReason(null);
      console.log('Cancelled dislike for:', messageId);
    }
  };

  // ---------- Отправка кастомной причины ----------
  const handleCustomReasonSubmit = () => {
    const trimmed = (customReasonText || '').trim();
    if (trimmed) {
      handleDislikeReason(trimmed);
      setCustomReasonText(null); // закрываем поле
      setIsDropdownOpen(false);  // закрываем меню
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 ms-4">
      {/* ---------- Лайк ---------- */}
      <Tooltip.Provider>
        <Tooltip.Root delayDuration={200}>
          <Tooltip.Trigger asChild>
            <button
              onClick={handleLike}
              disabled={isLoading}
              className={`p-1 rounded-md transition-all hover:scale-110 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="Полезный ответ"
            >
              <ThumbsUp
                size={16}
                className={`transition-colors ${
                  feedback === 'like' ? 'text-green-500' : 'text-gray-500'
                }`}
              />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="px-2 py-1 text-xs bg-gray-900 text-white rounded-md"
              sideOffset={5}
            >
              Полезный ответ
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

      {/* ---------- Дизлайк + DropdownMenu ---------- */}
      <Tooltip.Provider>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <Tooltip.Root delayDuration={200}>
            {/* 
              asChild + Trigger: клик по кнопке открывает меню.
              Тултип появляется при ховере НАД кнопкой (не срабатывает во время клика).
            */}
            <DropdownMenuTrigger asChild>
              <Tooltip.Trigger asChild>
                <button
                  onPointerDown={handleDislikeClick}
                  disabled={isLoading}
                  className={`p-1 rounded-md transition-all hover:scale-110 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Не помогло"
                >
                  <ThumbsDown
                    size={16}
                    className={`transition-colors ${
                      feedback === 'dislike' ? 'text-red-500' : 'text-gray-500'
                    }`}
                  />
                </button>
              </Tooltip.Trigger>
            </DropdownMenuTrigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="px-2 py-1 text-xs bg-gray-900 text-white rounded-md"
                sideOffset={5}
              >
                Не помогло
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          {/* Сама выпадашка */}
          <DropdownMenuContent align="start" side="top">
            <DropdownMenuItem onSelect={() => handleDislikeReason('factual_error')}>
              Ответ содержит фактическую ошибку
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleDislikeReason('off_topic')}>
              Ответ не по теме
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleDislikeReason('incomplete')}>
              Ответ неполный
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleDislikeReason('no_sources')}>
              Нет ссылок на источники
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Пункт "Другое": если поле открыто — показываем ввод, иначе просто пункт */}
          {customReasonText !== null ? (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customReasonText}
                  onChange={(e) => setCustomReasonText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCustomReasonSubmit();
                    }
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      setCustomReasonText(null); // закрываем поле, меню остаётся (или закрывается — как сейчас)
                    }
                  }}
                  placeholder="Введите причину..."
                  className="flex-1 px-2 py-1 text-sm rounded border border-[var(--color-accent)] 
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                            focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  autoFocus
                />
                <button
                  onClick={handleCustomReasonSubmit}
                  disabled={!customReasonText.trim()}
                  className="px-2 py-1 text-xs rounded bg-[var(--color-accent)] text-white 
                            hover:bg-[var(--color-hover)] disabled:opacity-50 disabled:cursor-not-allowed
                            transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          ) : (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setCustomReasonText(''); // открываем поле (пустая строка, но не null)
              }}
            >
              Другое
            </DropdownMenuItem>
          )}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip.Provider>

      {/* ---------- Поделиться ---------- */}
      <Tooltip.Provider>
        <Tooltip.Root delayDuration={200}>
          <Tooltip.Trigger asChild>
            <button
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110"
              aria-label="Поделиться"
            >
              <Share2 size={16} className="text-gray-500 transition-colors" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="px-2 py-1 text-xs bg-gray-900 text-white rounded-md"
              sideOffset={5}
            >
              Скопировать ответ
              <Tooltip.Arrow className="fill-gray-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
}