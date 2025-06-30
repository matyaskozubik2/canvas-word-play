
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GameHeader } from '@/components/GameHeader';
import { GameArea } from '@/components/GameArea';
import { GameSidebar } from '@/components/GameSidebar';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const Game = () => {
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { players, gameSettings, roomCode, playerName } = location.state || {};

  const {
    gameState,
    chatMessages,
    currentGuess,
    setCurrentGuess,
    hasGuessedCorrectly,
    selectWord,
    getDisplayWord,
    submitGuess
  } = useGameLogic(players, gameSettings, playerName);

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      <GameHeader
        roomCode={roomCode}
        currentRound={gameState.currentRound}
        totalRounds={gameState.totalRounds}
        timeLeft={gameState.timeLeft}
        totalTime={gameSettings?.drawTime || 80}
        currentDrawer={gameState.currentDrawer}
        shouldHideSidebarOnMobile={shouldHideSidebarOnMobile}
        showMobileSidebar={showMobileSidebar}
        onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
        onToggleFullscreen={toggleFullscreen}
      />

      <div className="flex h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)] overflow-hidden">
        <div className={`${shouldHideSidebarOnMobile && !showMobileSidebar ? 'w-full' : 'flex-1 max-w-[75%]'} p-1 sm:p-2 min-w-0`}>
          <GameArea
            phase={gameState.phase}
            isCurrentDrawer={isCurrentDrawer}
            currentDrawer={gameState.currentDrawer}
            currentWord={gameState.currentWord}
            timeLeft={gameState.timeLeft}
            wordOptions={gameState.wordOptions}
            displayWord={getDisplayWord()}
            wordLength={gameState.currentWord.length}
            onSelectWord={selectWord}
          />
        </div>

        {(!shouldHideSidebarOnMobile || showMobileSidebar) && (
          <div className="w-80 flex-shrink-0">
            <GameSidebar
              shouldHideSidebarOnMobile={shouldHideSidebarOnMobile}
              showMobileSidebar={showMobileSidebar}
              onToggleSidebar={() => setShowMobileSidebar(false)}
              scores={gameState.scores}
              currentDrawer={gameState.currentDrawer}
              chatMessages={chatMessages}
              isCurrentDrawer={isCurrentDrawer}
              hasGuessedCorrectly={hasGuessedCorrectly}
              gamePhase={gameState.phase}
              currentGuess={currentGuess}
              onCurrentGuessChange={setCurrentGuess}
              onSubmitGuess={submitGuess}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
