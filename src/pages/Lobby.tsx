
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, Crown, Users, Settings, Play, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { GameSettings } from '@/components/GameSettings';
import { PlayerList } from '@/components/PlayerList';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  avatar: string;
}

const Lobby = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playerName, roomCode: initialRoomCode, isHost } = location.state || {};

  const [roomCode, setRoomCode] = useState(initialRoomCode || generateRoomCode());
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameSettings, setGameSettings] = useState({
    rounds: 3,
    drawTime: 80,
    language: 'cs',
    customWords: [],
    maxPlayers: 8
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!playerName) {
      navigate('/');
      return;
    }

    // Simulate adding current player
    const currentPlayer: Player = {
      id: Math.random().toString(36),
      name: playerName,
      isHost: isHost || false,
      isReady: false,
      avatar: generateAvatar(playerName)
    };
    setPlayers([currentPlayer]);

    // Simulate other players joining
    if (isHost) {
      setTimeout(() => {
        const newPlayer: Player = {
          id: Math.random().toString(36),
          name: "Demo Hráč",
          isHost: false,
          isReady: true,
          avatar: generateAvatar("Demo Hráč")
        };
        setPlayers(prev => [...prev, newPlayer]);
      }, 2000);
    }
  }, [playerName, isHost, navigate]);

  function generateRoomCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  function generateAvatar(name: string): string {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const colorIndex = name.length % colors.length;
    return colors[colorIndex];
  }

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      toast({
        title: "Zkopírováno!",
        description: "Kód místnosti byl zkopírován do schránky",
      });
    } catch (err) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se zkopírovat kód",
        variant: "destructive"
      });
    }
  };

  const toggleReady = () => {
    setIsReady(!isReady);
    setPlayers(prev => prev.map(p => 
      p.name === playerName ? { ...p, isReady: !isReady } : p
    ));
  };

  const startGame = () => {
    if (players.length < 2) {
      toast({
        title: "Nedostatek hráčů",
        description: "Pro začátek hry jsou potřeba alespoň 2 hráči",
        variant: "destructive"
      });
      return;
    }

    navigate('/game', { 
      state: { 
        players, 
        gameSettings, 
        roomCode,
        playerName
      } 
    });
  };

  const currentPlayer = players.find(p => p.name === playerName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Lobby</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Připravte se na hru!</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Kód místnosti:</span>
              <Badge variant="secondary" className="text-lg font-mono px-3 py-1">
                {roomCode}
              </Badge>
              <Button size="sm" variant="outline" onClick={copyRoomCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Players List */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Hráči ({players.length}/{gameSettings.maxPlayers})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerList players={players} />
              </CardContent>
            </Card>
          </div>

          {/* Game Settings & Controls */}
          <div className="space-y-6">
            {/* Game Settings */}
            {currentPlayer?.isHost && (
              <GameSettings 
                settings={gameSettings}
                onSettingsChange={setGameSettings}
              />
            )}

            {/* Ready/Start Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Ovládání hry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!currentPlayer?.isHost ? (
                  <Button 
                    onClick={toggleReady}
                    className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${
                      isReady 
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    {isReady ? '✓ Připraven' : 'Připravit se'}
                  </Button>
                ) : (
                  <Button 
                    onClick={startGame}
                    className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105"
                    disabled={players.length < 2}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Začít hru
                  </Button>
                )}

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {currentPlayer?.isHost ? (
                    <div className="flex items-center justify-center space-x-1">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span>Jste hostitel místnosti</span>
                    </div>
                  ) : (
                    'Čekáte na hostititele'
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Room Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informace o místnosti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Kola:</span>
                  <span className="font-semibold">{gameSettings.rounds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Čas na kreslení:</span>
                  <span className="font-semibold">{gameSettings.drawTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Jazyk:</span>
                  <span className="font-semibold">
                    {gameSettings.language === 'cs' ? 'Čeština' : 'Angličtina'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
