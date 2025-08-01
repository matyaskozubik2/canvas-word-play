
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
  startSinglePlayerGame: () => void;
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
  startSinglePlayerGame,
  onShowQRScanner
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'multiplayer' | 'singleplayer'>('multiplayer');

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

  const multiplayerCards = [
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
    },
  ];

  const singleplayerCards = [
    {
      type: 'single',
      icon: Gamepad2,
      title: 'Jeden hráč',
      description: 'Zahrajte si sami proti počítači',
      gradientFrom: 'from-orange-500',
      gradientTo: 'to-red-500',
      focusColor: 'focus:border-orange-500',
      action: startSinglePlayerGame,
      actionText: 'Začít hru',
      actionIcon: Gamepad2,
    },
  ];

  const currentCards = activeTab === 'multiplayer' ? multiplayerCards : singleplayerCards;

  return (
    <>
      <GameCardBackdrop 
        isVisible={!!expandedCard}
        onClick={closeExpandedCard}
      />
      
      <div className="max-w-5xl mx-auto">
        {/* Záložky */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
            <button
              onClick={() => setActiveTab('multiplayer')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'multiplayer'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Více hráčů
            </button>
            <button
              onClick={() => setActiveTab('singleplayer')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'singleplayer'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Gamepad2 className="w-5 h-5 inline mr-2" />
              Jeden hráč
            </button>
          </div>
        </div>

        {/* Karty */}
        <div className={`grid gap-8 relative ${
          activeTab === 'multiplayer' ? 'md:grid-cols-3' : 'md:grid-cols-1 max-w-md mx-auto'
        }`}>
          {currentCards.map((config) => (
            <GameCard
              key={config.type}
              {...config}
              playerName={playerName}
              setPlayerName={setPlayerName}
              roomCode={('showRoomCodeInput' in config && config.showRoomCodeInput) ? roomCode : undefined}
              setRoomCode={('showRoomCodeInput' in config && config.showRoomCodeInput) ? setRoomCode : undefined}
              loading={loading}
              expanded={expandedCard === config.type}
              onCardClick={() => !loading && setExpandedCard(expandedCard === config.type ? null : config.type)}
              onClose={closeExpandedCard}
              onAction={(e) => {
                e.stopPropagation();
                handleCardClick(config.type, config.action);
              }}
              generateRandomName={generateRandomName}
              onShowQRScanner={('showRoomCodeInput' in config && config.showRoomCodeInput) ? onShowQRScanner : undefined}
            />
          ))}
        </div>
      </div>
    </>
  );
};
