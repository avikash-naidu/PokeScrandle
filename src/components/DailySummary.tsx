// src/components/DailySummary.tsx
import type { DailyProgress, Matchup } from '../types'
import { spriteUrl } from '../data/pokemon'
import styles from './DailySummary.module.css'

interface Props {
  progress: DailyProgress
  matchups: Matchup[]
  onClose:  () => void
}

export default function DailySummary({ progress, matchups, onClose }: Props) {
  const score = progress.results.filter(r => r === 'correct').length

  function handleShare(): void {
    const emoji = progress.results.map(r =>
      r === 'correct' ? '✅' : '❌'
    ).join('')

    const text = [
      `🍽️ Pokémon: Would You Rather Eat?`,
      `${new Date().toISOString().slice(0, 10)}`,
      `${score}/10`,
      emoji,
    ].join('\n')

    navigator.clipboard?.writeText(text)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>  {/* click backdrop to close */}
      <div className={styles.card} onClick={e => e.stopPropagation()}>  {/* don't close when clicking card */}
        {/* ── X button ── */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className={styles.title}>Today's Results</h2>
        <p className={styles.score}>{score}<span>/10</span></p>

        <div className={styles.matchupList}>
          {matchups.map((matchup, i) => {
            const result = progress.results[i]
            return (
              <div
                key={i}
                className={`${styles.matchupRow} ${result === 'correct' ? styles.correct : styles.incorrect}`}
              >
                <img src={spriteUrl(matchup.left.id)}  alt={matchup.left.name}  />
                <span className={styles.vs}>vs</span>
                <img src={spriteUrl(matchup.right.id)} alt={matchup.right.name} />
                <span className={styles.resultIcon}>
                  {result === 'correct' ? '✅' : '❌'}
                </span>
              </div>
            )
          })}
        </div>

        <button className={styles.shareBtn} onClick={handleShare}>
          Share result
        </button>

        <p className={styles.returnMsg}>Come back tomorrow for a new set!</p>
      </div>
    </div>
  )
}