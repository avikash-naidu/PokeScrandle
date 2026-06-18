import type { DailyProgress } from '../types'

const KEY = 'pokemon-eat-daily'

export function loadProgress(): DailyProgress | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed: DailyProgress = JSON.parse(raw)
    // If saved progress is from a different day, ignore it
    const today = new Date().toISOString().slice(0, 10)
    if (parsed.date !== today) return null
    return parsed
  } catch {
    return null
  }
}

export function saveProgress(progress: DailyProgress): void {
  localStorage.setItem(KEY, JSON.stringify(progress))
}

export function initProgress(): DailyProgress {
  return {
    date:      new Date().toISOString().slice(0, 10),
    results:   Array(10).fill(null),
    completed: false,
  }
}