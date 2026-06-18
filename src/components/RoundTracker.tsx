import type { RoundResult } from '../types'
import styles from './RoundTracker.module.css'

interface Props {
  results:      RoundResult[]
  currentRound: number
}

export default function RoundTracker({ results, currentRound }: Props) {
  return (
    <div className={styles.tracker}>
      {results.map((result, i) => (
        <div
          key={i}
          className={[
            styles.dot,
            i === currentRound ? styles.current  : '',
            result === 'correct'   ? styles.correct   : '',
            result === 'incorrect' ? styles.incorrect : '',
          ].filter(Boolean).join(' ')}
        />
      ))}
    </div>
  )
}