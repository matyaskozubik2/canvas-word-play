
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Menu, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameProgress } from '@/components/GameProgress';

interface GameHeaderProps {
  roomCode: string;
  currentRound: number;
  totalRounds: number;
  timeLeft: number;
  totalTime: number;
  currentDrawer: string;
  shouldHideSidebarOnMobile: boolean;
  showMobileSidebar: boolean;
  onToggleSidebar: () => void;
  onToggleFullscreen: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  roomCode,
  currentRound,
  totalRounds,
  timeLeft,
  totalTime,
  currentDrawer,
  shouldHideSidebarOnMobile,
  showMobileSidebar,
  onToggleSidebar,
  onToggleFullscreen
}) => {
  const navigate = useNavigate();

  return (
    <header className="p-2 sm:p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/lobby')}
            className="rounded-full flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">DrawGuess</h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Místnost: {roomCode}</p>
          </div>
        </div>

        <div className="hidden sm:block">
          <GameProgress 
            currentRound={currentRound}
            totalRounds={totalRounds}
            timeLeft={timeLeft}
            totalTime={totalTime}
          />
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleFullscreen}
            className="rounded-full"
          >
            <Maximize className="w-4 h-4" />
          </Button>

          {shouldHideSidebarOnMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleSidebar}
              className="md:hidden rounded-full"
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
          
          <div className="text-center hidden sm:block">
            <div className="text-sm text-gray-600 dark:text-gray-400">Kreslí</div>
            <div className="font-bold">{currentDrawer}</div>
          </div>
        </div>
      </div>

      <div className="sm:hidden mt-2">
        <GameProgress 
          currentRound={currentRound}
          totalRounds={totalRounds}
          timeLeft={timeLeft}
          totalTime={totalTime}
        />
      </div>
    </header>
  );
};
