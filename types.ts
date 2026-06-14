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
