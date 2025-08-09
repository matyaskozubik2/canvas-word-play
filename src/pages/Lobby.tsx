import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, Crown, Users, Settings, Play, ArrowLeft, Shuffle, AlertCircle, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QRCodeLib from 'qrcode';
import { useToast } from '@/hooks/use-toast';
import { GameSettings } from '@/components/GameSettings';
import { PlayerList } from '@/components/PlayerList';
import { gameService } from '@/services/gameService';
import { useRealtimeGame } from '@/hooks/useRealtimeGame';
import { Game, Player } from '@/types/game';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsPortrait } from '@/hooks/use-orientation';
import { OrientationOverlay } from '@/components/OrientationOverlay';

const Lobby = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playerName, roomCode: initialRoomCode, isHost, isRandomGame } = location.state || {};
  const isMobile = useIsMobile();
  const isPortrait = useIsPortrait();

  const [gameData, setGameData] = useState<{ game: Game; player: Player } | null>(null);
  const [gameSettings, setGameSettings] = useState({
    rounds: 3,
    drawTime: 80,
    language: 'cs',
    customWords: [],
    maxPlayers: 8
  });
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [qrCodeClicked, setQrCodeClicked] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const { game, players, error: realtimeError, startGame: startRealtimeGame } = useRealtimeGame(
    gameData?.game.id || null,
    gameData?.player.id || null
  );

  // Auto-navigate to game when it starts
  useEffect(() => {
    if (game && game.phase !== 'waiting' && gameData) {
      navigate('/game', { 
        state: { 
          gameId: game.id,
          playerId: gameData.player.id,
          playerName
        } 
      });
    }
  }, [game?.phase, gameData, navigate, playerName]);

  // Generate QR code when game data is available
  useEffect(() => {
    if (game?.room_code) {
      generateQRCodeUrl(game.room_code);
    }
  }, [game?.room_code]);

  useEffect(() => {
    if (!playerName) {
      navigate('/');
      return;
    }

    const initializeGame = async () => {
      try {
        setInitError(null);
        setLoading(true);
        console.log('Initializing game with:', { playerName, isHost, initialRoomCode, isRandomGame });
        
        if (isHost) {
          // Create new game
          console.log('Creating new game...');
          const result = await gameService.createGame(playerName, gameSettings);
          console.log('Game created:', result);
          setGameData(result);
        } else if (initialRoomCode) {
          // Join existing game
          console.log('Joining existing game with code:', initialRoomCode);
          const result = await gameService.joinGame(initialRoomCode, playerName);
          console.log('Joined game:', result);
          setGameData(result);
        } else if (isRandomGame) {
          // For random games, create a new game for now
          console.log('Creating random game...');
          const result = await gameService.createGame(playerName, gameSettings);
          console.log('Random game created:', result);
          setGameData(result);
        } else {
          throw new Error('Chybí informace o hře');
        }
      } catch (error) {
        console.error('Error initializing game:', error);
        const errorMessage = error instanceof Error ? error.message : 'Nepodařilo se připojit ke hře';
        setInitError(errorMessage);
        toast({
          title: 'Chyba',
          description: errorMessage,
          variant: 'destructive'
        });
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

  const handleQrCodeClick = () => {
    setQrCodeClicked(true);
    setTimeout(() => setQrCodeClicked(false), 300);
    copyRoomCode();
  };

  const generateQRCodeUrl = async (roomCode: string) => {
    try {
      const gameUrl = `${window.location.origin}/?join=${roomCode}`;
      const qrDataUrl = await QRCodeLib.toDataURL(gameUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const generateQRCode = (roomCode: string) => {
    return (
      <div 
        className={`w-20 h-20 bg-white border-2 border-gray-300 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-110 ${
          qrCodeClicked ? 'animate-pulse scale-125' : ''
        }`}
        onClick={handleQrCodeClick}
        title={`QR kód pro místnost: ${roomCode}`}
      >
        {qrCodeDataUrl ? (
          <img 
            src={qrCodeDataUrl} 
            alt={`QR kód pro místnost ${roomCode}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <QrCode className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
    );
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
  };

  const handleRetry = () => {
    setLoading(true);
    setInitError(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Načítání hry...</p>
        </div>
      </div>
    );
  }

  if (initError || realtimeError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Chyba připojení</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {initError || realtimeError}
            </p>
            <div className="space-y-2">
              <Button onClick={handleRetry} className="w-full">
                Zkusit znovu
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full"
              >
                Zpět na hlavní stránku
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameData || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">Čekání na data hry...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = players.find(p => p.id === gameData.player.id);
  const isCurrentHost = currentPlayer?.is_host || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <OrientationOverlay isActive={isMobile && isPortrait} />
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Kód místnosti:</span>
                <Badge variant="secondary" className="text-lg font-mono px-3 py-1">
                  {game.room_code}
                </Badge>
                <Button size="sm" variant="outline" onClick={copyRoomCode}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {generateQRCode(game.room_code)}
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
                  isReady: true, // All players are always ready now
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

            {/* Start Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Ovládání hry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCurrentHost ? (
                  <Button 
                    onClick={handleStartGame}
                    className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-300 hover:scale-105"
                    disabled={players.length < 2}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Začít hru
                  </Button>
                ) : (
                  <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="text-blue-600 dark:text-blue-400 font-semibold mb-2">
                      Připraven ke hře!
                    </div>
                    <div className="text-sm text-blue-500 dark:text-blue-300">
                      Čekáte na spuštění hry hostitelem
                    </div>
                  </div>
                )}

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {isCurrentHost ? (
                    <div className="flex items-center justify-center space-x-1">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span>Jste hostitel místnosti</span>
                    </div>
                  ) : (
                    'Čekáte na hostitele'
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
