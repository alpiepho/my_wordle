export type GameMode = 'daily' | 'unlimited'
export type GameStatus = 'playing' | 'won' | 'lost'

export interface GameStats {
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  maxStreak: number
  guessDistribution: Record<number, number> // 1-6 → count
  lastWinDate?: string // YYYY-MM-DD, for daily streak tracking
}

const STATS_KEYS: Record<GameMode, string> = {
  daily: 'wordle-stats-daily',
  unlimited: 'wordle-stats-unlimited',
}

function defaultStats(): GameStats {
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  }
}

export function loadStats(mode: GameMode): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEYS[mode])
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...defaultStats(), ...parsed }
    }
  } catch { /* ignore */ }
  return defaultStats()
}

export function saveStats(mode: GameMode, stats: GameStats): void {
  localStorage.setItem(STATS_KEYS[mode], JSON.stringify(stats))
}

/**
 * Record a game result and update stats.
 * @param guessCount Number of guesses (1-6), or null for a loss.
 * @param todayStr YYYY-MM-DD string for streak tracking.
 */
export function recordResult(
  mode: GameMode,
  guessCount: number | null,
  todayStr: string,
): GameStats {
  const stats = loadStats(mode)
  stats.gamesPlayed++

  if (guessCount !== null) {
    stats.gamesWon++
    stats.guessDistribution[guessCount] = (stats.guessDistribution[guessCount] || 0) + 1

    if (mode === 'daily') {
      // Daily streak: check if last win was yesterday
      if (stats.lastWinDate) {
        const last = new Date(stats.lastWinDate)
        const today = new Date(todayStr)
        const diffDays = Math.floor((today.getTime() - last.getTime()) / 86_400_000)
        if (diffDays === 1) {
          stats.currentStreak++
        } else if (diffDays > 1) {
          stats.currentStreak = 1
        }
        // diffDays === 0 means same day, streak stays
      } else {
        stats.currentStreak = 1
      }
      stats.lastWinDate = todayStr
    } else {
      // Unlimited: streak is just consecutive wins
      stats.currentStreak++
    }
  } else {
    stats.currentStreak = 0
  }

  stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak)
  saveStats(mode, stats)
  return stats
}
