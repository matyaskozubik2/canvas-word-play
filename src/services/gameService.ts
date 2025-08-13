import { supabase } from '@/integrations/supabase/client';
import { Game, Player, ChatMessage } from '@/types/game';

export const gameService = {
  // Game operations
  async createGame(hostName: string, settings: any): Promise<{ game: Game; player: Player }> {
    // Ensure user is authenticated anonymously
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const { error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw authError;
    }

    const roomCode = await this.generateRoomCode();
    
    console.log('Creating game with room code:', roomCode);
    
    // First create the game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({
        room_code: roomCode,
        host_id: '00000000-0000-0000-0000-000000000000', // Temporary host_id
        total_rounds: settings.rounds,
        draw_time: settings.drawTime,
        max_players: settings.maxPlayers
      })
      .select()
      .single();

    if (gameError) {
      console.error('Error creating game:', gameError);
      throw gameError;
    }

    console.log('Game created:', game);

    // Now create the player with the actual game ID
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        game_id: game.id,
        name: hostName,
        is_host: true,
        avatar_color: this.generateAvatarColor(hostName),
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (playerError) {
      console.error('Error creating player:', playerError);
      // Clean up game if player creation failed
      await supabase.from('games').delete().eq('id', game.id);
      throw playerError;
    }

    console.log('Player created:', player);

    // Update game with correct host_id
    const { data: updatedGame, error: updateGameError } = await supabase
      .from('games')
      .update({ host_id: player.id })
      .eq('id', game.id)
      .select()
      .single();

    if (updateGameError) {
      console.error('Error updating game host_id:', updateGameError);
      throw updateGameError;
    }

    console.log('Game updated with host_id:', updatedGame);

    try {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const device = /Mobi|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop';
      const locale = typeof navigator !== 'undefined' ? (Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || '') : '';
      const country = (locale.split('-')[1] || locale || null) as string | null;
      await supabase.from('player_activity').insert({
        player_id: player.id,
        game_id: updatedGame.id,
        player_name: player.name,
        room_code: updatedGame.room_code,
        device,
        country,
        user_agent: ua
      });
    } catch (e) {
      console.warn('Failed to log player activity (createGame):', e);
    }

    return { game: updatedGame, player };
  },

  async joinGame(roomCode: string, playerName: string): Promise<{ game: Game; player: Player }> {
    console.log('Attempting to join game with room code:', roomCode);
    
    // Ensure user is authenticated anonymously
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const { error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw authError;
    }
    
    // Use secure RPC function to join game
    const { data: result, error } = await supabase.rpc('join_game', {
      p_room_code: roomCode.toUpperCase(),
      p_player_name: playerName
    });

    if (error) {
      console.error('Error joining game via RPC:', error);
      throw error;
    }

    console.log('Successfully joined game via RPC:', result);

    // Type assertion for RPC result
    const gameResult = result as unknown as { game: Game; player: Player };

    try {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const device = /Mobi|Android|iPhone|iPad/i.test(ua) ? 'mobile' : 'desktop';
      const locale = typeof navigator !== 'undefined' ? (Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || '') : '';
      const country = (locale.split('-')[1] || locale || null) as string | null;
      await supabase.from('player_activity').insert({
        player_id: gameResult.player.id,
        game_id: gameResult.game.id,
        player_name: gameResult.player.name,
        room_code: gameResult.game.room_code,
        device,
        country,
        user_agent: ua
      });
    } catch (e) {
      console.warn('Failed to log player activity (joinGame):', e);
    }

    return gameResult;
  },

  async getGameByRoomCode(roomCode: string): Promise<Game | null> {
    console.log('Checking if room exists:', roomCode);
    
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .maybeSingle();

    if (error) {
      console.error('Error checking room:', error);
      return null;
    }
    
    console.log('Room check result:', data);
    return data;
  },

  async getGamePlayers(gameId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
    
    return data || [];
  },

  async updatePlayerReady(playerId: string, isReady: boolean): Promise<void> {
    const { error } = await supabase
      .from('players')
      .update({ is_ready: isReady })
      .eq('id', playerId);

    if (error) throw error;
  },

  async startGame(gameId: string): Promise<void> {
    const players = await this.getGamePlayers(gameId);
    const firstDrawer = players.find(p => p.is_host) || players[0];
    
    const { error: updateError } = await supabase
      .from('games')
      .update({
        phase: 'word-selection',
        current_drawer_id: firstDrawer.id,
        current_round: 1,
        word_options: this.generateWordOptions(),
        time_left: 30
      })
      .eq('id', gameId);

    if (updateError) throw updateError;
  },

  async selectWord(gameId: string, word: string): Promise<void> {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('draw_time')
      .eq('id', gameId)
      .single();

    if (gameError) throw gameError;

    const { error } = await supabase
      .from('games')
      .update({
        current_word: word,
        phase: 'drawing',
        word_options: null,
        time_left: game.draw_time
      })
      .eq('id', gameId);

    if (error) throw error;
  },

  async sendChatMessage(gameId: string, playerId: string, playerName: string, message: string, isGuess: boolean = false): Promise<void> {
    let isCorrect = false;
    
    if (isGuess) {
      // Check if guess is correct
      const { data: game } = await supabase
        .from('games')
        .select('current_word')
        .eq('id', gameId)
        .single();
        
      if (game && game.current_word) {
        isCorrect = message.toLowerCase().trim() === game.current_word.toLowerCase().trim();
        
        if (isCorrect) {
          // Update player as having guessed correctly
          const { error: updateError } = await supabase
            .from('players')
            .update({ 
              has_guessed_correctly: true,
            })
            .eq('id', playerId);

          if (updateError) {
            console.error('Error updating player guess status:', updateError);
          }

          // Add points to the player's score using RPC function
          const { error: scoreError } = await supabase.rpc('increment_player_score', {
            player_id: playerId,
            points: 10
          });

          if (scoreError) {
            console.error('Error updating player score:', scoreError);
          }
        }
      }
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        game_id: gameId,
        player_id: playerId,
        player_name: playerName,
        message: message,
        is_guess: isGuess,
        is_correct: isCorrect
      });

    if (error) throw error;
  },

  async endRound(gameId: string): Promise<void> {
    // Advance to next round or finish the game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, current_round, total_rounds, current_drawer_id')
      .eq('id', gameId)
      .single();

    if (gameError) throw gameError;
    if (!game) return;

    // If this was the last round, show results
    if ((game.current_round || 0) >= (game.total_rounds || 0)) {
      const { error } = await supabase
        .from('games')
        .update({ phase: 'results', time_left: 0 })
        .eq('id', gameId);
      if (error) throw error;
      return;
    }

    // Determine next drawer
    const players = await this.getGamePlayers(gameId);
    let nextDrawerId = game.current_drawer_id as string | undefined;
    if (players.length > 0) {
      const currentIdx = players.findIndex(p => p.id === game.current_drawer_id);
      const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % players.length : 0;
      nextDrawerId = players[nextIdx]?.id || nextDrawerId;
    }

    // Reset guessed flags for all players
    const { error: resetError } = await supabase
      .from('players')
      .update({ has_guessed_correctly: false })
      .eq('game_id', gameId);
    if (resetError) {
      console.error('Error resetting players guess flags:', resetError);
    }

    // Move to next round and back to word selection
    const { error: updateError } = await supabase
      .from('games')
      .update({
        current_round: (game.current_round || 0) + 1,
        phase: 'word-selection',
        current_drawer_id: nextDrawerId,
        current_word: null,
        word_options: this.generateWordOptions(),
        time_left: 30
      })
      .eq('id', gameId);

    if (updateError) throw updateError;
  },

  async getChatMessages(gameId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Helper functions
  async generateRoomCode(): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('generate_room_code');
      if (error) throw error;
      return data;
    } catch (error) {
      // Fallback if function doesn't work
      console.error('Error generating room code:', error);
      return this.generateFallbackRoomCode();
    }
  },

  generateFallbackRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  generateAvatarColor(name: string): string {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const colorIndex = name.length % colors.length;
    return colors[colorIndex];
  },

  generateWordOptions(): string[] {
    const EASY_WORDS = [
      'dům', 'ryba', 'auto', 'kočka', 'pes', 'slunce', 'měsíc', 'strom', 'květina', 'pták',
      'lampa', 'mrak', 'hory', 'kniha', 'mobil', 'tužka', 'stůl', 'židle', 'balón', 'okno',
      'míč', 'bota', 'klobouk', 'brýle', 'hodinky', 'klíč', 'dort', 'jablko', 'srdce', 'hvězda'
    ];
    const HARD_WORDS = [
      'mobilní aplikace', 'internet', 'nákup', 'nemocnice', 'doktor', 'letiště', 'pilot',
      'programátor', 'skladatel', 'zpěvák', 'kuchař', 'architekt', 'sochař', 'malíř',
      'čarodějnice', 'rytíř', 'princezna', 'robot', 'superhrdina', 'dinosaurus', 'planeta',
      'galaxie', 'vesmír', 'meteor', 'astronaut', 'skafandr', 'fotografie', 'časopis'
    ];
    
    // Always include at least one easy word
    const shuffledEasy = [...EASY_WORDS].sort(() => Math.random() - 0.5);
    const shuffledHard = [...HARD_WORDS].sort(() => Math.random() - 0.5);
    
    // Pick 1 easy word and 2 hard words, then shuffle the final selection
    const selectedWords = [
      shuffledEasy[0],
      shuffledHard[0],
      shuffledHard[1]
    ];
    
    return selectedWords.sort(() => Math.random() - 0.5);
  }
};
