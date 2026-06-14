import { createClient } from '@supabase/supabase-js'
import type { PokemonStats } from '../types'


// ── Replace these two values with your own from Supabase → Settings → API ──
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
console.log('Supabase Key Validated:', !!SUPABASE_KEY)


export const db = createClient(SUPABASE_URL, SUPABASE_KEY,{
  db: {
    schema: 'public',
  },
})
/**
 * Fetch live stats for a single Pokémon by Pokédex ID.
 * Returns { appearances, votes } or zeroes on error.
 */
export async function getStats(id: number): Promise<PokemonStats> {
  const { data, error } = await db
    .from('pokemon_stats')
    .select('votes,appearances')
    .eq('id', id)
    .single()

  if (error) {
    console.warn('getStats failed for id', id, error.message)
    return { appearances: 0, votes: 0 }
  }

  return data as PokemonStats
}

/**
 * Record the result of a matchup.
 * Winner gets +1 appearance and +1 vote.
 * Loser gets +1 appearance only.
 * Both RPC calls fire in parallel.
 */
export async function recordResult(
  winnerId: number,
  loserId:  number,
): Promise<void> {
  const [winnerRes, loserRes] = await Promise.all([
    db.rpc('increment_stats', {
      pokemon_id:      winnerId,
      add_appearances: 1,
      add_votes:       1,
    }),
    db.rpc('increment_stats', {
      pokemon_id:      loserId,
      add_appearances: 1,
      add_votes:       0,
    }),
  ])
  if (winnerRes.error) {
    console.error('❌ RPC failed for winner:', winnerRes.error.message, winnerRes.error.code)
  } else {
    console.log('✅ Winner recorded:', winnerId)
  }

  if (loserRes.error) {
    console.error('❌ RPC failed for loser:', loserRes.error.message, loserRes.error.code)
  } else {
    console.log('✅ Loser recorded:', loserId)
  }
}

/** Calculate selection percentage from a stats object */
export function selectionPct(stats: PokemonStats): number {
  if (stats.appearances === 0) return 0
  return (stats.votes / stats.appearances) * 100
}
