
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GameHeader } from '@/components/GameHeader';
import { GameArea } from '@/components/GameArea';
import { GameSidebar } from '@/components/GameSidebar';
import { useRealtimeGame } from '@/hooks/useRealtimeGame';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { OrientationOverlay } from '@/components/OrientationOverlay';
import { useIsPortrait } from '@/hooks/use-orientation';

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isPortrait = useIsPortrait();
  const { gameId, playerId, playerName } = location.state || {};

  const {
    game,
    players,
    chatMessages,
    loading,
    selectWord,
    sendMessage
  } = useRealtimeGame(gameId, playerId);

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentGuess, setCurrentGuess] = useState('');

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

  useEffect(() => {
    if (!gameId || !playerId || !playerName) {
      navigate('/');
      return;
    }
  }, [gameId, playerId, playerName, navigate]);

  const submitGuess = async () => {
    if (!currentGuess.trim() || !game) return;

    const currentPlayer = players.find(p => p.id === playerId);
    if (!currentPlayer || currentPlayer.has_guessed_correctly) return;

    await sendMessage(currentGuess, true);
    setCurrentGuess('');
  };

  const getDisplayWord = () => {
    if (!game?.current_word) return '';
    
    // For now, show the word partially revealed
    return game.current_word
      .split('')
      .map((letter, index) => {
        if (letter === ' ') return ' ';
        return Math.random() > 0.5 ? letter : '_';
      })
      .join(' ');
  };

  if (loading || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Načítání hry...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = players.find(p => p.id === playerId);
  const currentDrawer = players.find(p => p.id === game.current_drawer_id);
  const isCurrentDrawer = game.current_drawer_id === playerId;

  const gameState = {
    currentRound: game.current_round,
    totalRounds: game.total_rounds,
    currentDrawer: currentDrawer?.name || '',
    currentWord: game.current_word || '',
    timeLeft: game.time_left,
    phase: game.phase,
    scores: players.reduce((acc, player) => {
      acc[player.name] = player.score;
      return acc;
    }, {} as { [key: string]: number }),
    wordOptions: game.word_options
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 overflow-hidden">
      <OrientationOverlay isActive={isMobile && isPortrait} />
      <GameHeader
        roomCode={game.room_code}
        currentRound={gameState.currentRound}
        totalRounds={gameState.totalRounds}
        timeLeft={gameState.timeLeft}
        totalTime={game.draw_time}
        currentDrawer={gameState.currentDrawer}
        shouldHideSidebarOnMobile={false}
        showMobileSidebar={showMobileSidebar}
        onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
        onToggleFullscreen={toggleFullscreen}
      />

      <div className="flex h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)] overflow-hidden">
        {/* Sidebar on the left */}
        <div className={`${isMobile && !showMobileSidebar ? 'hidden' : ''} w-80 flex-shrink-0`}>
          <GameSidebar
            shouldHideSidebarOnMobile={false}
            showMobileSidebar={showMobileSidebar}
            onToggleSidebar={() => setShowMobileSidebar(false)}
            scores={gameState.scores}
            currentDrawer={gameState.currentDrawer}
            chatMessages={chatMessages.map(msg => ({
              id: msg.id,
              player: msg.player_name,
              message: msg.message,
              isGuess: msg.is_guess,
              isCorrect: msg.is_correct,
              timestamp: new Date(msg.created_at).getTime()
            }))}
            isCurrentDrawer={isCurrentDrawer}
            hasGuessedCorrectly={currentPlayer?.has_guessed_correctly || false}
            gamePhase={gameState.phase}
            currentGuess={currentGuess}
            onCurrentGuessChange={setCurrentGuess}
            onSubmitGuess={submitGuess}
          />
        </div>

        {/* Game area on the right */}
        <div className="flex-1 p-1 sm:p-2 min-w-0">
          <GameArea
            phase={gameState.phase}
            isCurrentDrawer={isCurrentDrawer}
            currentDrawer={gameState.currentDrawer}
            currentWord={gameState.currentWord}
            timeLeft={gameState.timeLeft}
            wordOptions={gameState.wordOptions || []}
            displayWord={getDisplayWord()}
            wordLength={gameState.currentWord.length}
            onSelectWord={selectWord}
            gameId={gameId}
            playerId={playerId}
          />
        </div>
      </div>
    </div>
  );
};

export default Game;
