
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Palette, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { ChatBox } from '@/components/ChatBox';
import { GameProgress } from '@/components/GameProgress';
import { useToast } from '@/hooks/use-toast';

interface GameState {
  currentRound: number;
  totalRounds: number;
  currentDrawer: string;
  currentWord: string;
  timeLeft: number;
  phase: 'waiting' | 'drawing' | 'results';
  scores: { [playerId: string]: number };
}

interface ChatMessage {
  id: string;
  player: string;
  message: string;
  isGuess: boolean;
  isCorrect?: boolean;
  timestamp: number;
}

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { players, gameSettings, roomCode, playerName } = location.state || {};

  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    totalRounds: gameSettings?.rounds || 3,
    currentDrawer: players?.[0]?.name || '',
    currentWord: 'DEMO SLOVO',
    timeLeft: gameSettings?.drawTime || 80,
    phase: 'drawing',
    scores: {}
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false);

  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!players || !playerName) {
      navigate('/');
      return;
    }

    // Initialize scores
    const initialScores: { [key: string]: number } = {};
    players.forEach((player: any) => {
      initialScores[player.name] = 0;
    });
    setGameState(prev => ({ ...prev, scores: initialScores }));

    // Start game timer
    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          // Time's up - end round
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          endRound();
          return { ...prev, timeLeft: 0, phase: 'results' };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  };

  const endRound = () => {
    toast({
      title: "Konec kola!",
      description: `Slovo bylo: ${gameState.currentWord}`,
    });

    setTimeout(() => {
      if (gameState.currentRound >= gameState.totalRounds) {
        // Game finished
        navigate('/results', { 
          state: { 
            scores: gameState.scores, 
            players,
            roomCode 
          } 
        });
      } else {
        // Next round
        nextRound();
      }
    }, 3000);
  };

  const nextRound = () => {
    const nextDrawerIndex = (players.findIndex((p: any) => p.name === gameState.currentDrawer) + 1) % players.length;
    const nextDrawer = players[nextDrawerIndex].name;
    
    setGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      currentDrawer: nextDrawer,
      currentWord: getRandomWord(),
      timeLeft: gameSettings.drawTime,
      phase: 'drawing'
    }));
    
    setHasGuessedCorrectly(false);
    setChatMessages([]);
    startTimer();
  };

  const getRandomWord = () => {
    const words = [
      'KOČKA', 'DŮM', 'AUTO', 'STROM', 'SLUNCE', 'KNIHA', 'TELEFON', 'KVĚTINA',
      'HRAD', 'LETADLO', 'RYBA', 'HORA', 'ČOKOLÁDA', 'KLAVÍR', 'MOTÝL', 'ZÁMEK'
    ];
    return words[Math.floor(Math.random() * words.length)];
  };

  const submitGuess = () => {
    if (!currentGuess.trim() || hasGuessedCorrectly) return;

    const isCorrect = currentGuess.toUpperCase().trim() === gameState.currentWord.toUpperCase();
    
    const newMessage: ChatMessage = {
      id: Math.random().toString(36),
      player: playerName,
      message: currentGuess,
      isGuess: true,
      isCorrect,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, newMessage]);

    if (isCorrect) {
      setHasGuessedCorrectly(true);
      const points = Math.max(10, Math.floor(gameState.timeLeft / 10) * 10);
      
      setGameState(prev => ({
        ...prev,
        scores: {
          ...prev.scores,
          [playerName]: (prev.scores[playerName] || 0) + points
        }
      }));

      toast({
        title: "Správně! 🎉",
        description: `Získáváte ${points} bodů!`,
      });
    }

    setCurrentGuess('');
  };

  const isCurrentDrawer = gameState.currentDrawer === playerName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Header */}
      <header className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/lobby')}
              className="rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">DrawGuess</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Místnost: {roomCode}</p>
            </div>
          </div>

          <GameProgress 
            currentRound={gameState.currentRound}
            totalRounds={gameState.totalRounds}
            timeLeft={gameState.timeLeft}
            totalTime={gameSettings.drawTime}
          />

          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">Kreslí</div>
              <div className="font-bold">{gameState.currentDrawer}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Game Area */}
        <div className="flex-1 p-4">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div>
                  {isCurrentDrawer ? (
                    <div className="flex items-center space-x-2">
                      <Palette className="w-5 h-5 text-purple-500" />
                      <span className="text-lg font-bold">Kreslíte: {gameState.currentWord}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">Hádejte, co kreslí {gameState.currentDrawer}!</span>
                    </div>
                  )}
                </div>
                
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Clock className="w-4 h-4 mr-2" />
                  {gameState.timeLeft}s
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-100px)]">
              <DrawingCanvas 
                canDraw={isCurrentDrawer}
                className="w-full h-full rounded-xl border-2 border-gray-200 dark:border-gray-700"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="w-80 p-4 space-y-4">
          {/* Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Skóre</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(gameState.scores)
                  .sort(([,a], [,b]) => b - a)
                  .map(([player, score]) => (
                  <div key={player} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className={`font-semibold ${player === gameState.currentDrawer ? 'text-purple-500' : ''}`}>
                      {player === gameState.currentDrawer && <Palette className="w-4 h-4 inline mr-1" />}
                      {player}
                    </span>
                    <Badge variant="secondary">{score}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Chat</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex flex-col">
              <ChatBox messages={chatMessages} className="flex-1" />
              
              {!isCurrentDrawer && !hasGuessedCorrectly && (
                <div className="flex space-x-2 mt-4">
                  <Input
                    placeholder="Napište svou odpověď..."
                    value={currentGuess}
                    onChange={(e) => setCurrentGuess(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
                    className="flex-1"
                  />
                  <Button onClick={submitGuess} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {hasGuessedCorrectly && (
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg text-center">
                  <span className="text-green-700 dark:text-green-300 font-semibold">
                    ✓ Správně! Čekáte na ostatní...
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Game;
