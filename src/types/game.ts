
export interface Game {
  id: string;
  room_code: string;
  host_id: string;
  current_round: number;
  total_rounds: number;
  draw_time: number;
  max_players: number;
  current_drawer_id?: string;
  current_word?: string;
  word_options?: string[];
  phase: 'waiting' | 'word-selection' | 'drawing' | 'results';
  time_left: number;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  game_id: string;
  name: string;
  is_host: boolean;
  is_ready: boolean;
  score: number;
  has_guessed_correctly: boolean;
  avatar_color: string;
  joined_at: string;
}

export interface ChatMessage {
  id: string;
  game_id: string;
  player_id: string;
  player_name: string;
  message: string;
  is_guess: boolean;
  is_correct: boolean;
  created_at: string;
}

export interface DrawingStroke {
  id?: string;
  game_id: string;
  round_number: number;
  stroke_data: any;
  created_at?: string;
}
