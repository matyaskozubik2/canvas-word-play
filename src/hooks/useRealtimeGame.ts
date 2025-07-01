
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Game, Player, ChatMessage } from '@/types/game';
import { gameService } from '@/services/gameService';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeGame = (gameId: string | null, playerId: string | null) => {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load initial data
  const loadGameData = useCallback(async () => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    try {
      console.log('Loading game data for gameId:', gameId);
      
      const [gameData, playersData, messagesData] = await Promise.all([
        supabase.from('games').select('*').eq('id', gameId).single(),
        gameService.getGamePlayers(gameId),
        gameService.getChatMessages(gameId)
      ]);

      console.log('Game data loaded:', { gameData, playersData, messagesData });

      if (gameData.error) {
        console.error('Game data error:', gameData.error);
        setError('Nepodařilo se načíst data hry');
        return;
      }

      if (gameData.data) setGame(gameData.data);
      setPlayers(playersData);
      setChatMessages(messagesData);
      setError(null);
    } catch (error) {
      console.error('Error loading game data:', error);
      setError('Nepodařilo se připojit ke hře');
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se načíst data hry',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [gameId, toast]);

  useEffect(() => {
    if (gameId) {
      loadGameData();
    } else {
      setLoading(false);
    }
  }, [gameId, loadGameData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!gameId) return;

    console.log('Setting up realtime subscriptions for game:', gameId);

    const gameChannel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          console.log('Game update:', payload);
          if (payload.eventType === 'UPDATE' && payload.new) {
            setGame(payload.new as Game);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          console.log('Players update:', payload);
          // Reload players data to keep it in sync
          gameService.getGamePlayers(gameId).then(setPlayers).catch(console.error);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          console.log('New chat message:', payload);
          if (payload.new) {
            setChatMessages(prev => [...prev, payload.new as ChatMessage]);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIPTION_ERROR' || status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error');
          setError('Chyba real-time připojení');
        }
      });

    return () => {
      console.log('Cleaning up realtime subscriptions');
      supabase.removeChannel(gameChannel);
    };
  }, [gameId]);

  // Game actions
  const updatePlayerReady = useCallback(async (isReady: boolean) => {
    if (!playerId) return;
    try {
      await gameService.updatePlayerReady(playerId, isReady);
    } catch (error) {
      console.error('Error updating ready status:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se aktualizovat stav připravenosti',
        variant: 'destructive'
      });
    }
  }, [playerId, toast]);

  const startGame = useCallback(async () => {
    if (!gameId) return;
    try {
      await gameService.startGame(gameId);
    } catch (error) {
      console.error('Error starting game:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se spustit hru',
        variant: 'destructive'
      });
    }
  }, [gameId, toast]);

  const selectWord = useCallback(async (word: string) => {
    if (!gameId) return;
    try {
      await gameService.selectWord(gameId, word);
    } catch (error) {
      console.error('Error selecting word:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se vybrat slovo',
        variant: 'destructive'
      });
    }
  }, [gameId, toast]);

  const sendMessage = useCallback(async (message: string, isGuess: boolean = false) => {
    if (!gameId || !playerId) return;
    
    const currentPlayer = players.find(p => p.id === playerId);
    if (!currentPlayer) return;

    try {
      await gameService.sendChatMessage(gameId, playerId, currentPlayer.name, message, isGuess);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se odeslat zprávu',
        variant: 'destructive'
      });
    }
  }, [gameId, playerId, players, toast]);

  return {
    game,
    players,
    chatMessages,
    loading,
    error,
    updatePlayerReady,
    startGame,
    selectWord,
    sendMessage
  };
};
