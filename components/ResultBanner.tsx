import styles from './ResultBanner.module.css'

interface Props {
  correct: boolean
  message: string
  visible: boolean
}

export default function ResultBanner({ correct, message, visible }: Props) {
  if (!visible) return null

  return (
    <div
      className={`${styles.banner} ${correct ? styles.correct : styles.wrong}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  )
}
