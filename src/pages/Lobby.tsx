
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, Crown, Users, Settings, Play, ArrowLeft, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { GameSettings } from '@/components/GameSettings';
import { PlayerList } from '@/components/PlayerList';
import { gameService } from '@/services/gameService';
import { useRealtimeGame } from '@/hooks/useRealtimeGame';
import { Game, Player } from '@/types/game';

const Lobby = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playerName, roomCode: initialRoomCode, isHost, isRandomGame } = location.state || {};

  const [gameData, setGameData] = useState<{ game: Game; player: Player } | null>(null);
  const [gameSettings, setGameSettings] = useState({
    rounds: 3,
    drawTime: 80,
    language: 'cs',
    customWords: [],
    maxPlayers: 8
  });
  const [loading, setLoading] = useState(true);

  const { game, players, updatePlayerReady, startGame: startRealtimeGame } = useRealtimeGame(
    gameData?.game.id || null,
    gameData?.player.id || null
  );

  useEffect(() => {
    if (!playerName) {
      navigate('/');
      return;
    }

    const initializeGame = async () => {
      try {
        if (isHost) {
          // Create new game
          const result = await gameService.createGame(playerName, gameSettings);
          setGameData(result);
        } else if (initialRoomCode) {
          // Join existing game
          const result = await gameService.joinGame(initialRoomCode, playerName);
          setGameData(result);
        } else if (isRandomGame) {
          // For random games, create a new game for now
          const result = await gameService.createGame(playerName, gameSettings);
          setGameData(result);
        }
      } catch (error) {
        console.error('Error initializing game:', error);
        toast({
          title: 'Chyba',
          description: 'Nepodařilo se připojit ke hře',
          variant: 'destructive'
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    initializeGame();
  }, [playerName, isHost, initialRoomCode, isRandomGame, navigate, toast]);

  const copyRoomCode = async () => {
    if (!game?.room_code) return;
    
    try {
      await navigator.clipboard.writeText(game.room_code);
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

  const toggleReady = async () => {
    if (!gameData) return;
    
    const currentPlayer = players.find(p => p.id === gameData.player.id);
    if (!currentPlayer) return;

    await updatePlayerReady(!currentPlayer.is_ready);
  };

  const handleStartGame = async () => {
    if (!gameData || !game) return;
    
    if (players.length < 2) {
      toast({
        title: "Nedostatek hráčů",
        description: "Pro začátek hry jsou potřeba alespoň 2 hráči",
        variant: "destructive"
      });
      return;
    }

    await startRealtimeGame();
    
    // Navigate to game page
    navigate('/game', { 
      state: { 
        gameId: game.id,
        playerId: gameData.player.id,
        playerName
      } 
    });
  };

  if (loading || !gameData || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Načítání hry...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = players.find(p => p.id === gameData.player.id);
  const isCurrentHost = currentPlayer?.is_host || false;

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
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <span>Lobby</span>
              {isRandomGame && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Shuffle className="w-3 h-3 mr-1" />
                  Náhodná hra
                </Badge>
              )}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isRandomGame ? "Připojeni k náhodné hře!" : "Připravte se na hru!"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Kód místnosti:</span>
              <Badge variant="secondary" className="text-lg font-mono px-3 py-1">
                {game.room_code}
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
                  <span>Hráči ({players.length}/{game.max_players})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerList players={players.map(p => ({
                  id: p.id,
                  name: p.name,
                  isHost: p.is_host,
                  isReady: p.is_ready,
                  avatar: p.avatar_color
                }))} />
              </CardContent>
            </Card>
          </div>

          {/* Game Settings & Controls */}
          <div className="space-y-6">
            {/* Game Settings */}
            {isCurrentHost && !isRandomGame && (
              <GameSettings 
                settings={gameSettings}
                onSettingsChange={setGameSettings}
              />
            )}

            {/* Random Game Info */}
            {isRandomGame && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shuffle className="w-5 h-5 text-green-500" />
                    <span>Náhodná hra</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Připojili jste se k náhodné hře s dalšími hráči. Nastavení hry určuje hostitel místnosti.</p>
                </CardContent>
              </Card>
            )}

            {/* Ready/Start Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Ovládání hry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isCurrentHost ? (
                  <Button 
                    onClick={toggleReady}
                    className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${
                      currentPlayer?.is_ready
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    {currentPlayer?.is_ready ? '✓ Připraven' : 'Připravit se'}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStartGame}
                    className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105"
                    disabled={players.length < 2}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Začít hru
                  </Button>
                )}

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {isCurrentHost ? (
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
                  <span className="font-semibold">{game.total_rounds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Čas na kreslení:</span>
                  <span className="font-semibold">{game.draw_time}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Jazyk:</span>
                  <span className="font-semibold">Čeština</span>
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
