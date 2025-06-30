
import React from 'react';
import { Clock, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { WordSelection } from '@/components/WordSelection';

interface GameAreaProps {
  phase: 'waiting' | 'word-selection' | 'drawing' | 'results';
  isCurrentDrawer: boolean;
  currentDrawer: string;
  currentWord: string;
  timeLeft: number;
  wordOptions?: string[];
  displayWord: string;
  wordLength: number;
  onSelectWord: (word: string) => void;
}

export const GameArea: React.FC<GameAreaProps> = ({
  phase,
  isCurrentDrawer,
  currentDrawer,
  currentWord,
  timeLeft,
  wordOptions,
  displayWord,
  wordLength,
  onSelectWord
}) => {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center gap-2">
            <div className="min-w-0 flex-1">
              {phase === 'word-selection' && isCurrentDrawer ? (
                <div className="flex items-center space-x-2">
                  <Palette className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500 flex-shrink-0" />
                  <span className="text-sm sm:text-lg font-bold truncate">Vyberte si slovo ke kreslení:</span>
                </div>
              ) : isCurrentDrawer ? (
                <div className="flex items-center space-x-2">
                  <Palette className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500 flex-shrink-0" />
                  <span className="text-sm sm:text-lg font-bold truncate">Kreslíte: {currentWord}</span>
                </div>
              ) : phase === 'word-selection' ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm sm:text-lg font-bold truncate">{currentDrawer} si vybírá slovo...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm sm:text-lg font-bold truncate">Hádejte, co kreslí {currentDrawer}!</span>
                </div>
              )}
            </div>
            
            <Badge variant="outline" className="text-sm sm:text-lg px-2 sm:px-4 py-1 sm:py-2 flex-shrink-0">
              <Clock className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              {timeLeft}s
            </Badge>
          </div>
          
          {phase === 'word-selection' && isCurrentDrawer && wordOptions && (
            <WordSelection wordOptions={wordOptions} onSelectWord={onSelectWord} />
          )}
          
          {!isCurrentDrawer && phase === 'drawing' && (
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-mono font-bold text-purple-600 dark:text-purple-400 tracking-widest">
                {displayWord}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {wordLength} písmen
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-100px)] sm:h-[calc(100%-140px)] p-2 sm:p-6">
        {phase === 'word-selection' ? (
          <div className="w-full h-full rounded-xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              {isCurrentDrawer ? (
                <div>
                  <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Vyberte si slovo ke kreslení</p>
                </div>
              ) : (
                <div>
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Čekáme na výběr slova...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <DrawingCanvas 
            canDraw={isCurrentDrawer}
            className="w-full h-full rounded-xl border-2 border-gray-200 dark:border-gray-700"
          />
        )}
      </CardContent>
    </Card>
  );
};
