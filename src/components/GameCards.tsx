
import React, { useState } from 'react';
import { Users, Shuffle, Settings, Gamepad2, QrCode } from 'lucide-react';
import { GameCard } from './GameCard';
import { GameCardBackdrop } from './GameCardBackdrop';

interface GameCardsProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
  loading: boolean;
  generateRandomName: () => void;
  createRoom: () => void;
  joinRandomGame: () => void;
  joinRoom: () => void;
  onShowQRScanner: () => void;
}

export const GameCards: React.FC<GameCardsProps> = ({
  playerName,
  setPlayerName,
  roomCode,
  setRoomCode,
  loading,
  generateRandomName,
  createRoom,
  joinRandomGame,
  joinRoom,
  onShowQRScanner
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleCardClick = (cardType: string, action: () => void) => {
    if (loading) return;
    
    setExpandedCard(cardType);
    
    // Delay the action to allow animation to show
    setTimeout(() => {
      action();
      setExpandedCard(null);
    }, 300);
  };

  const closeExpandedCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCard(null);
  };

  const cardConfigs = [
    {
      type: 'create',
      icon: Users,
      title: 'Vytvořit místnost',
      description: 'Založte novou hru a pozvěte přátele',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-pink-500',
      focusColor: 'focus:border-purple-500',
      action: createRoom,
      actionText: 'Vytvořit hru',
      actionIcon: Gamepad2,
      badge: 'Více hráčů',
    },
    {
      type: 'random',
      icon: Shuffle,
      title: 'Náhodná hra',
      description: 'Zahrajte si s neznámými hráči',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-emerald-500',
      focusColor: 'focus:border-green-500',
      action: joinRandomGame,
      actionText: 'Najít hru',
      actionIcon: Shuffle,
      badge: 'Více hráčů',
    },
    {
      type: 'join',
      icon: Settings,
      title: 'Připojit se',
      description: 'Vstupte do existující místnosti',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-cyan-500',
      focusColor: 'focus:border-blue-500',
      action: joinRoom,
      actionText: 'Připojit se ke hře',
      actionIcon: QrCode,
      showRoomCodeInput: true,
      badge: 'Více hráčů',
    },
    {
      type: 'single',
      icon: Gamepad2,
      title: 'Jeden hráč',
      description: 'Zahrajte si sami proti počítači',
      gradientFrom: 'from-orange-500',
      gradientTo: 'to-red-500',
      focusColor: 'focus:border-orange-500',
      action: () => console.log('Single player game'),
      actionText: 'Začít hru',
      actionIcon: Gamepad2,
      badge: 'Jeden hráč',
    },
  ];

  return (
    <>
      <GameCardBackdrop 
        isVisible={!!expandedCard}
        onClick={closeExpandedCard}
      />
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {cardConfigs.map((config) => (
          <GameCard
            key={config.type}
            {...config}
            playerName={playerName}
            setPlayerName={setPlayerName}
            roomCode={config.showRoomCodeInput ? roomCode : undefined}
            setRoomCode={config.showRoomCodeInput ? setRoomCode : undefined}
            loading={loading}
            expanded={expandedCard === config.type}
            onCardClick={() => !loading && setExpandedCard(expandedCard === config.type ? null : config.type)}
            onClose={closeExpandedCard}
            onAction={(e) => {
              e.stopPropagation();
              handleCardClick(config.type, config.action);
            }}
            generateRandomName={generateRandomName}
            onShowQRScanner={config.showRoomCodeInput ? onShowQRScanner : undefined}
          />
        ))}
      </div>
    </>
  );
};
