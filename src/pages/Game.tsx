import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Palette, Send, Menu, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { ChatBox } from '@/components/ChatBox';
import { GameProgress } from '@/components/GameProgress';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameState {
  currentRound: number;
  totalRounds: number;
  currentDrawer: string;
  currentWord: string;
  timeLeft: number;
  phase: 'waiting' | 'word-selection' | 'drawing' | 'results';
  scores: { [playerId: string]: number };
  revealedLetters: boolean[];
  wordOptions?: string[];
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
  const isMobile = useIsMobile();
  const { players, gameSettings, roomCode, playerName } = location.state || {};

  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    totalRounds: gameSettings?.rounds || 3,
    currentDrawer: players?.[0]?.name || '',
    currentWord: '',
    timeLeft: gameSettings?.drawTime || 80,
    phase: 'word-selection',
    scores: {},
    revealedLetters: [],
    wordOptions: []
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false);

  const timerRef = useRef<NodeJS.Timeout>();
  const hintTimerRef = useRef<NodeJS.Timeout>();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    
    // Generate word options for first round
    const wordOptions = generateWordOptions();
    
    setGameState(prev => ({ 
      ...prev, 
      scores: initialScores,
      wordOptions: wordOptions,
      phase: 'word-selection'
    }));

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (hintTimerRef.current) {
        clearInterval(hintTimerRef.current);
      }
    };
  }, []);

  const generateWordOptions = () => {
    const words = [
      'KOČKA', 'DŮM', 'AUTO', 'STROM', 'SLUNCE', 'KNIHA', 'TELEFON', 'KVĚTINA',
      'HRAD', 'LETADLO', 'RYBA', 'HORA', 'ČOKOLÁDA', 'KLAVÍR', 'MOTÝL', 'ZÁMEK',
      'MÍČEK', 'OKNO', 'ŽIDLE', 'KOŠILE', 'JABLKO', 'KOLO', 'PIZZA', 'KLOBOUK'
    ];
    
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  const selectWord = (selectedWord: string) => {
    const initialRevealed = new Array(selectedWord.length).fill(false);
    
    setGameState(prev => ({
      ...prev,
      currentWord: selectedWord,
      revealedLetters: initialRevealed,
      phase: 'drawing'
    }));
    
    // Start timers after word selection
    startTimer();
    startHintTimer();
  };

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
          if (hintTimerRef.current) {
            clearInterval(hintTimerRef.current);
          }
          endRound();
          return { ...prev, timeLeft: 0, phase: 'results' };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  };

  const startHintTimer = () => {
    if (hintTimerRef.current) {
      clearInterval(hintTimerRef.current);
    }

    // Reveal letters every 15 seconds
    hintTimerRef.current = setInterval(() => {
      setGameState(prev => {
        const newRevealed = [...prev.revealedLetters];
        const unrevealedIndices = newRevealed
          .map((revealed, index) => revealed ? null : index)
          .filter(index => index !== null) as number[];
        
        if (unrevealedIndices.length > 0) {
          const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
          newRevealed[randomIndex] = true;
        }
        
        return { ...prev, revealedLetters: newRevealed };
      });
    }, 15000);
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
    const wordOptions = generateWordOptions();
    
    setGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      currentDrawer: nextDrawer,
      currentWord: '',
      timeLeft: gameSettings.drawTime,
      phase: 'word-selection',
      revealedLetters: [],
      wordOptions: wordOptions
    }));
    
    setHasGuessedCorrectly(false);
    setChatMessages([]);
  };

  const getRandomWord = () => {
    const words = [
      'KOČKA', 'DŮM', 'AUTO', 'STROM', 'SLUNCE', 'KNIHA', 'TELEFON', 'KVĚTINA',
      'HRAD', 'LETADLO', 'RYBA', 'HORA', 'ČOKOLÁDA', 'KLAVÍR', 'MOTÝL', 'ZÁMEK'
    ];
    return words[Math.floor(Math.random() * words.length)];
  };

  const getDisplayWord = () => {
    return gameState.currentWord
      .split('')
      .map((letter, index) => {
        if (letter === ' ') return ' ';
        return gameState.revealedLetters[index] ? letter : '_';
      })
      .join(' ');
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        toast({
          title: "Chyba",
          description: "Nepodařilo se přepnout na celou obrazovku",
          variant: "destructive"
        });
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const isCurrentDrawer = gameState.currentDrawer === playerName;
  const shouldHideSidebarOnMobile = isMobile && isCurrentDrawer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 overflow-hidden">
      {/* Header */}
      <header className="p-2 sm:p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/lobby')}
              className="rounded-full flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">DrawGuess</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Místnost: {roomCode}</p>
            </div>
          </div>

          <div className="hidden sm:block">
            <GameProgress 
              currentRound={gameState.currentRound}
              totalRounds={gameState.totalRounds}
              timeLeft={gameState.timeLeft}
              totalTime={gameSettings.drawTime}
            />
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Fullscreen button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="rounded-full"
            >
              <Maximize className="w-4 h-4" />
            </Button>

            {/* Mobile sidebar toggle */}
            {shouldHideSidebarOnMobile && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="md:hidden rounded-full"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            
            <div className="text-center hidden sm:block">
              <div className="text-sm text-gray-600 dark:text-gray-400">Kreslí</div>
              <div className="font-bold">{gameState.currentDrawer}</div>
            </div>
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="sm:hidden mt-2">
          <GameProgress 
            currentRound={gameState.currentRound}
            totalRounds={gameState.totalRounds}
            timeLeft={gameState.timeLeft}
            totalTime={gameSettings.drawTime}
          />
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)] overflow-hidden">
        {/* Game Area */}
        <div className={`${shouldHideSidebarOnMobile && !showMobileSidebar ? 'w-full' : 'flex-1'} p-2 sm:p-4 min-w-0`}>
          <Card className="h-full overflow-hidden">
            <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center gap-2">
                  <div className="min-w-0 flex-1">
                    {gameState.phase === 'word-selection' && isCurrentDrawer ? (
                      <div className="flex items-center space-x-2">
                        <Palette className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500 flex-shrink-0" />
                        <span className="text-sm sm:text-lg font-bold truncate">Vyberte si slovo ke kreslení:</span>
                      </div>
                    ) : isCurrentDrawer ? (
                      <div className="flex items-center space-x-2">
                        <Palette className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500 flex-shrink-0" />
                        <span className="text-sm sm:text-lg font-bold truncate">Kreslíte: {gameState.currentWord}</span>
                      </div>
                    ) : gameState.phase === 'word-selection' ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm sm:text-lg font-bold truncate">{gameState.currentDrawer} si vybírá slovo...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm sm:text-lg font-bold truncate">Hádejte, co kreslí {gameState.currentDrawer}!</span>
                      </div>
                    )}
                  </div>
                  
                  <Badge variant="outline" className="text-sm sm:text-lg px-2 sm:px-4 py-1 sm:py-2 flex-shrink-0">
                    <Clock className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                    {gameState.timeLeft}s
                  </Badge>
                </div>
                
                {gameState.phase === 'word-selection' && isCurrentDrawer && (
                  <div className="flex justify-center">
                    <Select onValueChange={selectWord}>
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue placeholder="Vyberte slovo" />
                      </SelectTrigger>
                      <SelectContent>
                        {gameState.wordOptions?.map((word) => (
                          <SelectItem key={word} value={word}>
                            {word}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {!isCurrentDrawer && gameState.phase === 'drawing' && (
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-mono font-bold text-purple-600 dark:text-purple-400 tracking-widest">
                      {getDisplayWord()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {gameState.currentWord.length} písmen
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-100px)] sm:h-[calc(100%-140px)] p-2 sm:p-6">
              {gameState.phase === 'word-selection' ? (
                <div className="w-full h-full rounded-xl border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    {isCurrentDrawer ? (
                      <div>
                        <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Vyberte si slovo ke kreslení</p>
                      </div>
                    ) : (
                      <div>
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Čekáme na výběr slova...</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <DrawingCanvas 
                  canDraw={isCurrentDrawer}
                  className="w-full h-full rounded-xl border-2 border-gray-200 dark:border-gray-700"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        {(!shouldHideSidebarOnMobile || showMobileSidebar) && (
          <div className={`w-80 max-w-[90vw] p-2 sm:p-4 space-y-4 overflow-hidden ${shouldHideSidebarOnMobile ? 'absolute right-0 top-0 h-full bg-white dark:bg-gray-900 z-50 shadow-xl' : ''}`}>
            {/* Close button for mobile overlay */}
            {shouldHideSidebarOnMobile && showMobileSidebar && (
              <div className="flex justify-end mb-4 pt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowMobileSidebar(false)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Scores */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Users className="w-4 h-4" />
                  <span>Skóre</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {Object.entries(gameState.scores)
                    .sort(([,a], [,b]) => b - a)
                    .map(([player, score]) => (
                    <div key={player} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <span className={`font-semibold text-sm truncate ${player === gameState.currentDrawer ? 'text-purple-500' : ''}`}>
                        {player === gameState.currentDrawer && <Palette className="w-3 h-3 inline mr-1" />}
                        {player}
                      </span>
                      <Badge variant="secondary" className="ml-2 flex-shrink-0">{score}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Chat</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden min-h-0">
                <ChatBox messages={chatMessages} className="flex-1 overflow-hidden" />
                
                {!isCurrentDrawer && !hasGuessedCorrectly && gameState.phase === 'drawing' && (
                  <div className="flex space-x-2 mt-4">
                    <Input
                      placeholder="Napište svou odpověď..."
                      value={currentGuess}
                      onChange={(e) => setCurrentGuess(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
                      className="flex-1 min-w-0"
                    />
                    <Button onClick={submitGuess} size="icon" className="flex-shrink-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {hasGuessedCorrectly && (
                  <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg text-center">
                    <span className="text-green-700 dark:text-green-300 font-semibold text-sm">
                      ✓ Správně! Čekáte na ostatní...
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
