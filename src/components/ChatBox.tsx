
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
    <ScrollArea className={`${className} p-2`} ref={scrollRef}>
      <div className="space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.isGuess
                ? message.isCorrect
                  ? 'bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700'
                  : 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700'
                : 'bg-gray-50 dark:bg-gray-800'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    {message.player}
                  </span>
                  {message.isCorrect && (
                    <span className="text-green-600 dark:text-green-400 text-xs font-bold">
                      ✓ SPRÁVNĚ!
                    </span>
                  )}
                </div>
                <p className="text-gray-900 dark:text-gray-100 mt-1">
                  {message.message}
                </p>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Zatím žádné zprávy...
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
