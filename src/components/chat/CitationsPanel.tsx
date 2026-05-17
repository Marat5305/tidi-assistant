// src/components/chat/CitationsPanel.tsx
import { useState } from 'react';
import { Link2, ChevronRight, ExternalLink } from 'lucide-react';
import type { Citation } from '../../types/chat';

interface CitationsPanelProps {
  citations: Citation[];
  activeCitationId?: string | null;
  onCitationClick?: (citationId: string) => void;
}

export function CitationsPanel({ citations, activeCitationId, onCitationClick }: CitationsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 ms-4">
      <p className="text-xs text-gray-500 mb-2 font-medium">Источники:</p>
      
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {citations.map((citation) => {
          const isExpanded = expandedId === citation.id;
          
          return (
            <div
              key={citation.id}
              onClick={() => onCitationClick?.(citation.id)}
              className={`
                flex-shrink-0 rounded-lg border transition-all duration-200
                hover:shadow-sm cursor-pointer
                ${activeCitationId === citation.id
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-md'
                    : 'border-[var(--color-surface)] bg-white dark:bg-gray-800 hover:border-[var(--color-accent)]'
                }
                ${isExpanded ? 'w-64' : 'w-40'}
                `}
            >
              {/* Компактный вид */}
              {!isExpanded && (
                <button
                  onClick={() => setExpandedId(citation.id)}
                  className="w-full p-2 text-left"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="flex-shrink-0 w-5 h-5 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold flex items-center justify-center">
                      {citation.number}
                    </span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                      {citation.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">
                    {citation.snippet}
                  </p>
                </button>
              )}

              {/* Развёрнутый вид */}
              {isExpanded && (
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold flex items-center justify-center">
                        {citation.number}
                      </span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                        {citation.title}
                      </span>
                    </div>
                    <button
                      onClick={() => setExpandedId(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ChevronRight size={14} className="rotate-90" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-4">
                    {citation.snippet}
                  </p>
                  
                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[var(--color-accent)] hover:text-[var(--color-hover)]"
                    >
                      <ExternalLink size={12} />
                      Открыть источник
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}