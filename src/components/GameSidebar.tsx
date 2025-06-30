
import React from 'react';
import { ArrowLeft, Users, Palette, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChatBox } from '@/components/ChatBox';

interface ChatMessage {
  id: string;
  player: string;
  message: string;
  isGuess: boolean;
  isCorrect?: boolean;
  timestamp: number;
}

interface GameSidebarProps {
  shouldHideSidebarOnMobile: boolean;
  showMobileSidebar: boolean;
  onToggleSidebar: () => void;
  scores: { [playerId: string]: number };
  currentDrawer: string;
  chatMessages: ChatMessage[];
  isCurrentDrawer: boolean;
  hasGuessedCorrectly: boolean;
  gamePhase: string;
  currentGuess: string;
  onCurrentGuessChange: (value: string) => void;
  onSubmitGuess: () => void;
}

export const GameSidebar: React.FC<GameSidebarProps> = ({
  shouldHideSidebarOnMobile,
  showMobileSidebar,
  onToggleSidebar,
  scores,
  currentDrawer,
  chatMessages,
  isCurrentDrawer,
  hasGuessedCorrectly,
  gamePhase,
  currentGuess,
  onCurrentGuessChange,
  onSubmitGuess
}) => {
  if (!shouldHideSidebarOnMobile && !showMobileSidebar) return null;

  return (
    <div className={`w-80 max-w-[90vw] p-2 sm:p-4 space-y-4 overflow-hidden ${shouldHideSidebarOnMobile ? 'absolute right-0 top-0 h-full bg-white dark:bg-gray-900 z-50 shadow-xl' : ''}`}>
      {shouldHideSidebarOnMobile && showMobileSidebar && (
        <div className="flex justify-end mb-4 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleSidebar}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Scores */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Users className="w-4 h-4" />
            <span>Skóre</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-48 overflow-y-auto">
          <div className="space-y-2">
            {Object.entries(scores)
              .sort(([,a], [,b]) => b - a)
              .map(([player, score]) => (
              <div key={player} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <span className={`font-semibold text-sm truncate ${player === currentDrawer ? 'text-purple-500' : ''}`}>
                  {player === currentDrawer && <Palette className="w-3 h-3 inline mr-1" />}
                  {player}
                </span>
                <Badge variant="secondary" className="ml-2 flex-shrink-0">{score}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden min-h-0">
          <ChatBox messages={chatMessages} className="flex-1 overflow-hidden" />
          
          {!isCurrentDrawer && !hasGuessedCorrectly && gamePhase === 'drawing' && (
            <div className="flex space-x-2 mt-4">
              <Input
                placeholder="Napište svou odpověď..."
                value={currentGuess}
                onChange={(e) => onCurrentGuessChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSubmitGuess()}
                className="flex-1 min-w-0"
              />
              <Button onClick={onSubmitGuess} size="icon" className="flex-shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {hasGuessedCorrectly && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg text-center">
              <span className="text-green-700 dark:text-green-300 font-semibold text-sm">
                ✓ Správně! Čekáte na ostatní...
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
