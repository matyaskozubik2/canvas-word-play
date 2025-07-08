
import React from 'react';
import { Users, Shuffle, Settings, Gamepad2, Dices, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
      {/* Create Room Card */}
      <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Vytvořit místnost</CardTitle>
          <CardDescription>Založte novou hru a pozvěte přátele</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input 
              placeholder="Vaše jméno" 
              value={playerName} 
              onChange={e => setPlayerName(e.target.value)} 
              className="rounded-xl border-2 focus:border-purple-500 transition-colors flex-1" 
              disabled={loading} 
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={generateRandomName} 
              className="rounded-xl flex-shrink-0" 
              disabled={loading}
            >
              <Dices className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            onClick={createRoom} 
            className="w-full rounded-xl h-12 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105" 
            disabled={loading}
          >
            <Gamepad2 className="w-5 h-5 mr-2" />
            {loading ? 'Vytváří se...' : 'Vytvořit hru'}
          </Button>
        </CardContent>
      </Card>

      {/* Join Random Game Card */}
      <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
            <Shuffle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Náhodná hra</CardTitle>
          <CardDescription>Zahrajte si s neznámými hráči</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input 
              placeholder="Vaše jméno" 
              value={playerName} 
              onChange={e => setPlayerName(e.target.value)} 
              className="rounded-xl border-2 focus:border-green-500 transition-colors flex-1" 
              disabled={loading} 
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={generateRandomName} 
              className="rounded-xl flex-shrink-0" 
              disabled={loading}
            >
              <Dices className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            onClick={joinRandomGame} 
            className="w-full rounded-xl h-12 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105" 
            disabled={loading}
          >
            <Shuffle className="w-5 h-5 mr-2" />
            {loading ? 'Vytváří se...' : 'Najít hru'}
          </Button>
        </CardContent>
      </Card>

      {/* Join Room Card */}
      <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Připojit se</CardTitle>
          <CardDescription>Vstupte do existující místnosti</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input 
              placeholder="Vaše jméno" 
              value={playerName} 
              onChange={e => setPlayerName(e.target.value)} 
              className="rounded-xl border-2 focus:border-blue-500 transition-colors flex-1" 
              disabled={loading} 
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={generateRandomName} 
              className="rounded-xl flex-shrink-0" 
              disabled={loading}
            >
              <Dices className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Input 
              placeholder="Kód místnosti" 
              value={roomCode} 
              onChange={e => setRoomCode(e.target.value.toUpperCase())} 
              className="rounded-xl border-2 focus:border-blue-500 transition-colors flex-1" 
              disabled={loading} 
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onShowQRScanner} 
              className="rounded-xl flex-shrink-0" 
              disabled={loading}
              title="Skenovat QR kód"
            >
              <QrCode className="w-4 h-4" />
            </Button>
          </div>
          <Button 
            onClick={joinRoom} 
            variant="outline" 
            className="w-full rounded-xl h-12 text-lg font-semibold border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-105" 
            disabled={loading}
          >
            {loading ? 'Připojuje se...' : 'Připojit se ke hře'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
