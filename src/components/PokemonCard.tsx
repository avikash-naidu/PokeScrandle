import type { Pokemon, PokemonStats, GamePhase } from '../types'
import { spriteUrl } from '../data/pokemon'
import styles from './PokemonCard.module.css'

interface Props {
  pokemon:  Pokemon
  phase:    GamePhase
  isWinner: boolean
  stats:    PokemonStats | null
  onGuess:  () => void
}

export default function PokemonCard({ pokemon, phase, isWinner, stats, onGuess }: Props) {
  const clickable = phase === 'playing'

  const pct: number | null =
    stats && stats.appearances > 0
      ? (stats.votes / stats.appearances) * 100
      : null

  const cardClass = [
    styles.card,
    clickable                          ? styles.clickable : '',
    phase === 'reveal' && isWinner     ? styles.winner    : '',
    phase === 'reveal' && !isWinner    ? styles.loser     : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cardClass}
      onClick={clickable ? onGuess : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => e.key === 'Enter' && onGuess() : undefined}
      aria-label={clickable ? `Pick ${pokemon.name}` : undefined}
    >
      <img
        className={styles.sprite}
        src={spriteUrl(pokemon.id)}
        alt={pokemon.name}
        draggable={false}
      />

      <h2 className={styles.name}>{pokemon.name}</h2>

      {/* % bar — animates in after a guess */}
      <div className={`${styles.barWrap} ${phase === 'reveal' ? styles.barVisible : ''}`}>
        <div className={styles.barTrack}>
          <div
            className={[
              styles.barFill,
              phase === 'reveal' ? (isWinner ? styles.fillWin : styles.fillLose) : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              width:
                phase === 'reveal' && pct !== null
                  ? `${pct.toFixed(1)}%`
                  : '0%',
            }}
          />
        </div>
        <span className={styles.pctLabel}>
          {phase === 'reveal' && pct !== null ? `${pct.toFixed(1)}%` : ''}
        </span>
      </div>

      <p className={styles.matchups}>
        {phase === 'reveal' && stats
          ? `${stats.appearances.toLocaleString()} matchup${stats.appearances !== 1 ? 's' : ''}`
          : ''}
      </p>
    </div>
  )
}
