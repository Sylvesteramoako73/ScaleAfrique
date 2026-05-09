import { clsx } from 'clsx';
import { Zap } from 'lucide-react';
import { formatRelativeDate } from '../../utils/formatters';
import type { AIMessage } from '../../types';

export function ChatMessage({ message }: { message: AIMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={clsx('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
        isUser ? 'bg-primary-600 text-white' : 'bg-gray-900 text-white'
      )}>
        {isUser ? <span className="text-xs font-bold">You</span> : <Zap size={14} />}
      </div>

      {/* Bubble */}
      <div className={clsx('max-w-[75%] flex flex-col gap-1', isUser && 'items-end')}>
        <div
          className={clsx(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-primary-600 text-white rounded-tr-sm'
              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
          )}
        >
          {message.content}
        </div>
        <span className="text-xs text-gray-400">{formatRelativeDate(message.timestamp)}</span>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0">
        <Zap size={14} />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
