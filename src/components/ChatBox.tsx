
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
  id: string;
  player: string;
  message: string;
  isGuess: boolean;
  isCorrect?: boolean;
  timestamp: number;
}

interface ChatBoxProps {
  messages: ChatMessage[];
  className?: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ messages, className = '' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollArea className={`${className} p-2 h-full overflow-hidden`} ref={scrollRef}>
      <div className="space-y-2 pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-2 sm:p-3 rounded-lg break-words ${
              message.isGuess
                ? message.isCorrect
                  ? 'bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700'
                  : 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700'
                : 'bg-gray-50 dark:bg-gray-800'
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">
                    {message.player}
                  </span>
                  {message.isCorrect && (
                    <span className="text-green-600 dark:text-green-400 text-xs font-bold flex-shrink-0">
                      ✓ SPRÁVNĚ!
                    </span>
                  )}
                </div>
                <p className="text-gray-900 dark:text-gray-100 text-sm break-words">
                  {message.message}
                </p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
            Zatím žádné zprávy...
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
