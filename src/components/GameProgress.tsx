
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
    <div className="flex items-center space-x-6">
      {/* Round Progress */}
      <div className="text-center">
        <div className="flex items-center space-x-2 mb-1">
          <Target className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-semibold">
            Kolo {currentRound}/{totalRounds}
          </span>
        </div>
        <Progress value={roundProgress} className="w-20 h-2" />
      </div>

      {/* Time Progress */}
      <div className="text-center">
        <div className="flex items-center space-x-2 mb-1">
          <Clock className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold">
            {timeLeft}s
          </span>
        </div>
        <Progress 
          value={timeProgress} 
          className="w-24 h-2"
          // Change color based on time left
          // Red when < 20%, orange when < 50%, green otherwise
        />
      </div>
    </div>
  );
};
