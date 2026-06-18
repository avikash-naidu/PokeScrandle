// ── Domain types ────────────────────────────────────────────────────────────

/** A single Gen 1 Pokémon entry from the data file */
export interface Pokemon {
  id:       number
  name:     string
  eatScore: number
  reason:   string
}

/** Row shape returned from Supabase pokemon_stats table */
export interface PokemonStats {
  appearances: number
  votes:       number
}

/** The three phases the game moves through */
export type GamePhase = 'playing' | 'reveal' | 'gameover'

/** Which Pokémon are currently in the left / right card slots */
export interface RoundState {
  left:  Pokemon
  right: Pokemon
}

/** Live stats for both cards — null until after a guess is made */
export interface StatsState {
  left:  PokemonStats | null
  right: PokemonStats | null
}

/** Result of a guess — drives the banner and card states */
export interface GuessResult {
  correct: boolean
  message: string
}
// Result of a single round — null means not answered yet
export type RoundResult = 'correct' | 'incorrect' | null

// One matchup in the daily set
export interface Matchup {
  left:  Pokemon
  right: Pokemon
}

// The mode the game is in
export type GameMode = 'daily'  // can extend later with 'streak' etc

// Saved to localStorage so progress persists on refresh
export interface DailyProgress {
  date:      string        // "2024-01-15"
  results:   RoundResult[] // length 10, null = not played yet
  completed: boolean
}