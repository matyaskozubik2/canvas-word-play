
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, Target } from 'lucide-react';

interface GameProgressProps {
  currentRound: number;
  totalRounds: number;
  timeLeft: number;
  totalTime: number;
}

export const GameProgress: React.FC<GameProgressProps> = ({
  currentRound,
  totalRounds,
  timeLeft,
  totalTime
}) => {
  const timeProgress = (timeLeft / totalTime) * 100;
  const roundProgress = (currentRound / totalRounds) * 100;

  return (
    <div className="flex items-center justify-center space-x-3 sm:space-x-6">
      {/* Round Progress */}
      <div className="text-center">
        <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
          <Target className="w-3 sm:w-4 h-3 sm:h-4 text-purple-500" />
          <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
            Kolo {currentRound}/{totalRounds}
          </span>
        </div>
        <Progress value={roundProgress} className="w-16 sm:w-20 h-1.5 sm:h-2" />
      </div>

      {/* Time Progress */}
      <div className="text-center">
        <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
          <Clock className="w-3 sm:w-4 h-3 sm:h-4 text-orange-500" />
          <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
            {timeLeft}s
          </span>
        </div>
        <Progress 
          value={timeProgress} 
          className="w-20 sm:w-24 h-1.5 sm:h-2"
        />
      </div>
    </div>
  );
};
