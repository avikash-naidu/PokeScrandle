import { useRef } from 'react'
import styles from './GameOver.module.css'

interface Props {
  streak:  number
  onReset: () => void
}

export default function GameOver({ streak, onReset }: Props) {
  const shareBtnRef = useRef<HTMLButtonElement>(null)

  function handleShare(): void {
    const text = `🍽️ Pokémon: Would You Rather Eat?\nI got a streak of ${streak}! Can you beat me?`

    navigator.clipboard?.writeText(text).then(() => {
      if (shareBtnRef.current) {
        shareBtnRef.current.textContent = 'Copied!'
        setTimeout(() => {
          if (shareBtnRef.current) {
            shareBtnRef.current.textContent = 'Share result'
          }
        }, 2000)
      }
    })
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Game over">
      <div className={styles.card}>
        <h2 className={styles.title}>Game Over</h2>
        <p className={styles.sub}>Final streak</p>
        <p className={styles.streak}>{streak}</p>
        <button className={styles.playBtn} onClick={onReset}>
          Play again
        </button>
        <button
          ref={shareBtnRef}
          className={styles.shareBtn}
          onClick={handleShare}
        >
          Share result
        </button>
      </div>
    </div>
  )
}
