
import React from 'react';
import { Crown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  avatar: string;
}

interface PlayerListProps {
  players: Player[];
}

export const PlayerList: React.FC<PlayerListProps> = ({ players }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {players.map((player) => (
        <div 
          key={player.id}
          className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Avatar className="w-12 h-12">
            <AvatarFallback className={`${player.avatar} text-white font-bold text-lg`}>
              {player.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-lg">{player.name}</span>
              {player.isHost && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            
            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
              Připraven
            </div>
          </div>
        </div>
      ))}
      
      {/* Empty slots */}
      {Array.from({ length: Math.max(0, 8 - players.length) }).map((_, index) => (
        <div 
          key={`empty-${index}`}
          className="flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 opacity-50"
        >
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
              ?
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <span className="text-gray-500 dark:text-gray-400">Čeká na hráče...</span>
          </div>
        </div>
      ))}
    </div>
  );
};
