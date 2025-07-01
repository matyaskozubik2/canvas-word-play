
import { supabase } from '@/integrations/supabase/client';
import { Game, Player, ChatMessage } from '@/types/game';

export const gameService = {
  // Game operations
  async createGame(hostName: string, settings: any): Promise<{ game: Game; player: Player }> {
    const roomCode = await this.generateRoomCode();
    
    // First create player to get the actual host ID
    const tempGame = {
      room_code: roomCode,
      host_id: crypto.randomUUID(), // Generate temporary UUID
      total_rounds: settings.rounds,
      draw_time: settings.drawTime,
      max_players: settings.maxPlayers
    };

    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert(tempGame)
      .select()
      .single();

    if (gameError) throw gameError;

    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        game_id: game.id,
        name: hostName,
        is_host: true,
        avatar_color: this.generateAvatarColor(hostName)
      })
      .select()
      .single();

    if (playerError) throw playerError;

    // Update game with actual host_id
    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update({ host_id: player.id })
      .eq('id', game.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return { game: updatedGame, player };
  },

  async joinGame(roomCode: string, playerName: string): Promise<{ game: Game; player: Player }> {
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .single();

    if (gameError) throw gameError;

    // Check if game is full
    const players = await this.getGamePlayers(game.id);
    if (players.length >= game.max_players) {
      throw new Error('Hra je plná');
    }

    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        game_id: game.id,
        name: playerName,
        is_host: false,
        avatar_color: this.generateAvatarColor(playerName)
      })
      .select()
      .single();

    if (playerError) throw playerError;

    return { game, player };
  },

  async getGameByRoomCode(roomCode: string): Promise<Game | null> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .single();

    if (error) return null;
    return data;
  },

  async getGamePlayers(gameId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
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
    
    const { data: game, error: updateError } = await supabase
      .from('games')
      .update({
        phase: 'word-selection',
        current_drawer_id: firstDrawer.id,
        word_options: this.generateWordOptions(),
        time_left: 30
      })
      .eq('id', gameId)
      .select()
      .single();

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
          await supabase
            .from('players')
            .update({ 
              has_guessed_correctly: true,
              score: supabase.raw('score + 10') // Add points for correct guess
            })
            .eq('id', playerId);
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
      'lampa', 'mrak', 'hory', 'kniha', 'mobil', 'tužka', 'stůl', 'židle', 'balón', 'okno'
    ];
    const HARD_WORDS = [
      'mobilní aplikace', 'internet', 'nákup', 'nemocnice', 'doktor', 'letiště', 'pilot',
      'programátor', 'skladatel', 'zpěvák', 'kuchař', 'architekt', 'sochař', 'malíř'
    ];
    
    const allWords = [...EASY_WORDS, ...HARD_WORDS];
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }
};
