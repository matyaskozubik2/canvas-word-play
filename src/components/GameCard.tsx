
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dices, X } from 'lucide-react';

interface GameCardProps {
  type: string;
  icon: LucideIcon;
  title: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  focusColor: string;
  playerName: string;
  setPlayerName: (name: string) => void;
  roomCode?: string;
  setRoomCode?: (code: string) => void;
  loading: boolean;
  expanded: boolean;
  onCardClick: () => void;
  onClose: (e: React.MouseEvent) => void;
  onAction: (e: React.MouseEvent) => void;
  generateRandomName: () => void;
  onShowQRScanner?: () => void;
  actionText: string;
  actionIcon: LucideIcon;
  showRoomCodeInput?: boolean;
  badge?: string;
}

export const GameCard: React.FC<GameCardProps> = ({
  type,
  icon: Icon,
  title,
  description,
  gradientFrom,
  gradientTo,
  focusColor,
  playerName,
  setPlayerName,
  roomCode,
  setRoomCode,
  loading,
  expanded,
  onCardClick,
  onClose,
  onAction,
  generateRandomName,
  onShowQRScanner,
  actionText,
  actionIcon: ActionIcon,
  showRoomCodeInput = false,
  badge,
}) => {
  return (
    <Card 
      className={`relative overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 cursor-pointer ${
        expanded
          ? 'fixed inset-0 z-50 m-auto max-w-md max-h-fit transition-all duration-500 ease-out animate-in zoom-in-95 fade-in-0' 
          : 'hover:scale-105'
      }`}
      onClick={onCardClick}
    >
      {expanded && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 rounded-full h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
      <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${gradientFrom} ${gradientTo}`}></div>
      {badge && (
        <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white`}>
          {badge}
        </div>
      )}
      <CardHeader className="text-center pb-4">
        <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-2xl flex items-center justify-center`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input 
            placeholder="Vaše jméno" 
            value={playerName} 
            onChange={e => setPlayerName(e.target.value)} 
            className={`rounded-xl border-2 ${focusColor} transition-colors flex-1`}
            disabled={loading} 
            onClick={(e) => e.stopPropagation()}
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              generateRandomName();
            }} 
            className="rounded-xl flex-shrink-0" 
            disabled={loading}
          >
            <Dices className="w-4 h-4" />
          </Button>
        </div>
        {showRoomCodeInput && roomCode !== undefined && setRoomCode && (
          <div className="flex space-x-2">
            <Input 
              placeholder="Kód místnosti" 
              value={roomCode} 
              onChange={e => setRoomCode(e.target.value.toUpperCase())} 
              className={`rounded-xl border-2 ${focusColor} transition-colors flex-1`}
              disabled={loading} 
              onClick={(e) => e.stopPropagation()}
            />
            {onShowQRScanner && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  onShowQRScanner();
                }} 
                className="rounded-xl flex-shrink-0" 
                disabled={loading}
                title="Skenovat QR kód"
              >
                <Dices className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
        <Button 
          onClick={onAction}
          className={`w-full rounded-xl h-12 text-lg font-semibold ${
            type === 'join' 
              ? `border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white` 
              : `bg-gradient-to-r ${gradientFrom} ${gradientTo} hover:${gradientFrom.replace('500', '600')} hover:${gradientTo.replace('500', '600')}`
          } transition-all duration-300 hover:scale-105`}
          variant={type === 'join' ? 'outline' : 'default'}
          disabled={loading}
        >
          <ActionIcon className="w-5 h-5 mr-2" />
          {loading ? (type === 'create' ? 'Vytváří se...' : type === 'random' ? 'Vytváří se...' : 'Připojuje se...') : actionText}
        </Button>
      </CardContent>
    </Card>
  );
};
