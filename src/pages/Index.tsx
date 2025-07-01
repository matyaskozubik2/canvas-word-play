import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Users, Palette, Gamepad2, Settings, Shuffle, Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { gameService } from '@/services/gameService';

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check system preference for dark mode
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const generateRandomName = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPlayerName(result);
  };

  const createRoom = () => {
    if (!playerName.trim()) {
      toast({
        title: "Chyba",
        description: "Prosím, zadejte své jméno",
        variant: "destructive"
      });
      return;
    }
    navigate('/lobby', { state: { playerName, isHost: true } });
  };

  const joinRoom = async () => {
    if (!playerName.trim() || !roomCode.trim()) {
      toast({
        title: "Chyba",
        description: "Prosím, zadejte jméno a kód místnosti",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if room exists
      const game = await gameService.getGameByRoomCode(roomCode);
      if (!game) {
        toast({
          title: "Chyba",
          description: "Místnost s tímto kódem neexistuje",
          variant: "destructive"
        });
        return;
      }

      navigate('/lobby', { state: { playerName, roomCode, isHost: false } });
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodařilo se připojit k místnosti",
        variant: "destructive"
      });
    }
  };

  const joinRandomGame = () => {
    if (!playerName.trim()) {
      toast({
        title: "Chyba",
        description: "Prosím, zadejte své jméno",
        variant: "destructive"
      });
      return;
    }
    
    // For now, create a new game for random games
    toast({
      title: "Vytváření hry...",
      description: "Vytváříme pro vás novou hru",
    });

    setTimeout(() => {
      navigate('/lobby', { 
        state: { 
          playerName, 
          isHost: true,
          isRandomGame: true 
        } 
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 transition-all duration-500">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            DrawGuess
          </h1>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-full hover:scale-105 transition-transform"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Kreslíte. Hádáte. Bavíte se.
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Moderní multiplayerová kreslící hra pro přátele. Vytvořte místnost nebo se připojte ke hře!
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {/* Create Room Card */}
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
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
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="rounded-xl border-2 focus:border-purple-500 transition-colors flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={generateRandomName}
                  className="rounded-xl flex-shrink-0"
                >
                  <Dices className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                onClick={createRoom}
                className="w-full rounded-xl h-12 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105"
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                Vytvořit hru
              </Button>
            </CardContent>
          </Card>

          {/* Join Random Game Card */}
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
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
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="rounded-xl border-2 focus:border-green-500 transition-colors flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={generateRandomName}
                  className="rounded-xl flex-shrink-0"
                >
                  <Dices className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                onClick={joinRandomGame}
                className="w-full rounded-xl h-12 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:scale-105"
              >
                <Shuffle className="w-5 h-5 mr-2" />
                Najít hru
              </Button>
            </CardContent>
          </Card>

          {/* Join Room Card */}
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
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
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="rounded-xl border-2 focus:border-blue-500 transition-colors flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={generateRandomName}
                  className="rounded-xl flex-shrink-0"
                >
                  <Dices className="w-4 h-4" />
                </Button>
              </div>
              <Input
                placeholder="Kód místnosti"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="rounded-xl border-2 focus:border-blue-500 transition-colors"
              />
              <Button 
                onClick={joinRoom}
                variant="outline"
                className="w-full rounded-xl h-12 text-lg font-semibold border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-105"
              >
                Připojit se ke hře
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-800 dark:text-white">
            Proč si zamilujete DrawGuess?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: "🎨",
                title: "Kreativní kreslení",
                description: "Plynulé kreslení s pokročilými nástroji"
              },
              {
                icon: "🌍",
                title: "Více jazyků",
                description: "Slovníky v češtině, angličtině a dalších"
              },
              {
                icon: "📱",
                title: "Všechna zařízení",
                description: "Perfektní na počítači i telefonu"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
