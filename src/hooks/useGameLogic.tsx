
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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

export const useGameLogic = (players: any[], gameSettings: any, playerName: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
        navigate('/results', { 
          state: { 
            scores: gameState.scores, 
            players,
            roomCode: 'temp' 
          } 
        });
      } else {
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

  useEffect(() => {
    if (!players || !playerName) {
      navigate('/');
      return;
    }

    const initialScores: { [key: string]: number } = {};
    players.forEach((player: any) => {
      initialScores[player.name] = 0;
    });
    
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

  return {
    gameState,
    chatMessages,
    currentGuess,
    setCurrentGuess,
    hasGuessedCorrectly,
    selectWord,
    getDisplayWord,
    submitGuess
  };
};
