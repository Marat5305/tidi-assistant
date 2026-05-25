// src/utils/threadGrouping.ts
import type { Thread } from '../types/chat';

export type ThreadGroup = {
  title: string;      // "Сегодня", "Вчера", "На этой неделе", "Ранее"
  threads: Thread[];
};

/**
 * Группирует треды по временным меткам
 * @param threads - массив тредов
 * @returns массив групп для рендеринга
 */
export function groupThreadsByDate(threads: Thread[]): ThreadGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: ThreadGroup[] = [
    { title: 'Сегодня', threads: [] },
    { title: 'Вчера', threads: [] },
    { title: 'На этой неделе', threads: [] },
    { title: 'Ранее', threads: [] },
  ];

  threads.forEach((thread) => {
    const threadDate = new Date(thread.updatedAt || thread.createdAt);
    const compareDate = new Date(threadDate.getFullYear(), threadDate.getMonth(), threadDate.getDate());

    if (compareDate.getTime() === today.getTime()) {
      groups[0].threads.push(thread);
    } else if (compareDate.getTime() === yesterday.getTime()) {
      groups[1].threads.push(thread);
    } else if (compareDate > weekAgo) {
      groups[2].threads.push(thread);
    } else {
      groups[3].threads.push(thread);
    }
  });

  // Возвращаем только непустые группы
  return groups.filter((group) => group.threads.length > 0);
}