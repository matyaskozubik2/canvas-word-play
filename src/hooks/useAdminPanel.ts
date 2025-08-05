import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Game, Player } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

interface ModerationLog {
  id: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  created_at: string;
}

interface GameWithPlayers extends Game {
  players: Player[];
  player_count: number;
}

export const useAdminPanel = () => {
  const [games, setGames] = useState<GameWithPlayers[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameWithPlayers | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGames = useCallback(async () => {
    try {
      // Fetch games with their players
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select(`
          *,
          players (*)
        `)
        .order('created_at', { ascending: false });

      if (gamesError) throw gamesError;

      // Filter out inactive games (older than 30 minutes or no players)
      const activeGames = (gamesData || [])
        .map((game: any) => ({
          ...game,
          player_count: game.players?.length || 0
        }))
        .filter((game: GameWithPlayers) => {
          const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
          const gameCreated = new Date(game.created_at);
          return game.player_count > 0 && gameCreated > thirtyMinutesAgo;
        });

      setGames(activeGames);
    } catch (error: any) {
      console.error('Error fetching games:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se načíst hry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const kickPlayer = useCallback(async (playerId: string, playerName: string, gameId: string) => {
    try {
      const session = await supabase.auth.getSession();
      const adminEmail = session.data.session?.user?.email;

      if (!adminEmail) {
        throw new Error('Nejste přihlášeni');
      }

      // Remove player from game
      const { error: kickError } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (kickError) throw kickError;

      // Log the action
      const { error: logError } = await supabase
        .from('moderation_logs')
        .insert({
          admin_email: adminEmail,
          action: 'kick_player',
          target_type: 'player',
          target_id: playerId,
          details: {
            player_name: playerName,
            game_id: gameId
          }
        });

      if (logError) throw logError;

      toast({
        title: "Úspěch",
        description: `Hráč ${playerName} byl odstraněn ze hry`
      });

      // Refresh games
      await fetchGames();
    } catch (error: any) {
      console.error('Error kicking player:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se odstranit hráče",
        variant: "destructive"
      });
    }
  }, [toast, fetchGames]);

  const deleteGame = useCallback(async (gameId: string, roomCode: string) => {
    try {
      const session = await supabase.auth.getSession();
      const adminEmail = session.data.session?.user?.email;

      if (!adminEmail) {
        throw new Error('Nejste přihlášeni');
      }

      // Delete all players first (due to foreign key constraints)
      const { error: playersError } = await supabase
        .from('players')
        .delete()
        .eq('game_id', gameId);

      if (playersError) throw playersError;

      // Delete chat messages
      const { error: chatError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('game_id', gameId);

      if (chatError) throw chatError;

      // Delete drawing strokes
      const { error: strokesError } = await supabase
        .from('drawing_strokes')
        .delete()
        .eq('game_id', gameId);

      if (strokesError) throw strokesError;

      // Delete game
      const { error: gameError } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      if (gameError) throw gameError;

      // Log the action
      const { error: logError } = await supabase
        .from('moderation_logs')
        .insert({
          admin_email: adminEmail,
          action: 'delete_game',
          target_type: 'game',
          target_id: gameId,
          details: {
            room_code: roomCode
          }
        });

      if (logError) throw logError;

      toast({
        title: "Úspěch",
        description: `Místnost ${roomCode} byla smazána`
      });

      // Clear selected game if it was deleted
      if (selectedGame?.id === gameId) {
        setSelectedGame(null);
      }

      // Refresh games
      await fetchGames();
    } catch (error: any) {
      console.error('Error deleting game:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se smazat místnost",
        variant: "destructive"
      });
    }
  }, [toast, fetchGames, selectedGame]);

  // Real-time subscriptions
  useEffect(() => {
    fetchGames();

    const gamesChannel = supabase
      .channel('admin-games')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games' }, 
        () => fetchGames()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'players' }, 
        () => fetchGames()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gamesChannel);
    };
  }, [fetchGames]);

  // Filter games based on search term
  const filteredGames = games.filter(game => 
    game.room_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPhaseText = (phase: string) => {
    switch (phase) {
      case 'waiting': return 'Čekání';
      case 'word-selection': return 'Výběr slova';
      case 'drawing': return 'Kreslení';
      case 'results': return 'Výsledky';
      default: return phase;
    }
  };

  return {
    games: filteredGames,
    selectedGame,
    setSelectedGame,
    searchTerm,
    setSearchTerm,
    loading,
    kickPlayer,
    deleteGame,
    getPhaseText,
    refreshGames: fetchGames
  };
};