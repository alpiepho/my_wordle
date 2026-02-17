import { useState, useCallback, useEffect } from 'react'
import type { EvaluatedLetter } from '@/utils/evaluateGuess'
import { evaluateGuess } from '@/utils/evaluateGuess'
import type { LetterState } from '@/utils/evaluateGuess'
import { validateHardMode } from '@/utils/hardMode'
import { getDailyWord, getRandomWord, getTodayString, getDailyNumber } from '@/utils/dailyWord'
import { VALID_GUESSES } from '@/data/validGuesses'
import { ANSWER_WORDS } from '@/data/words'
import type { GameMode, GameStatus } from '@/hooks/useStats'
import { recordResult } from '@/hooks/useStats'

const WORD_LENGTH = 5

interface SavedGameState {
  date?: string // for daily mode
  answer: string
  guesses: EvaluatedLetter[][]
  gameStatus: GameStatus
  hardMode: boolean
  tenTriesMode: boolean
}

interface GameState {
  mode: GameMode
  answer: string
  guesses: EvaluatedLetter[][]
  currentGuess: string
  gameStatus: GameStatus
  hardMode: boolean
  tenTriesMode: boolean
  puzzleNumber: number
  /** Map of letter → best state from all guesses */
  usedLetters: Record<string, LetterState>
  /** toast message, cleared by the UI */
  toastMessage: string | null
  /** trigger for shake animation */
  shakeRow: boolean
  /** which row just won (for bounce) */
  revealRow: number | null
}

function getStateKey(mode: GameMode): string {
  return mode === 'daily' ? 'wordle-daily-state' : 'wordle-unlimited-state'
}

function loadSettings(): { hardMode: boolean; mode: GameMode; tenTriesMode: boolean } {
  try {
    const raw = localStorage.getItem('wordle-settings')
    if (raw) {
      const parsed = JSON.parse(raw)
      return { hardMode: parsed.hardMode ?? false, mode: parsed.mode ?? 'daily', tenTriesMode: parsed.tenTriesMode ?? false }
    }
  } catch { /* ignore */ }
  return { hardMode: false, mode: 'daily', tenTriesMode: false }
}

function saveHardModeSetting(hardMode: boolean) {
  const existing = JSON.parse(localStorage.getItem('wordle-settings') || '{}')
  localStorage.setItem('wordle-settings', JSON.stringify({ ...existing, hardMode }))
}

function saveGameModeSetting(mode: GameMode) {
  const existing = JSON.parse(localStorage.getItem('wordle-settings') || '{}')
  localStorage.setItem('wordle-settings', JSON.stringify({ ...existing, mode }))
}

function saveTenTriesSetting(tenTriesMode: boolean) {
  const existing = JSON.parse(localStorage.getItem('wordle-settings') || '{}')
  localStorage.setItem('wordle-settings', JSON.stringify({ ...existing, tenTriesMode }))
}

function buildUsedLetters(guesses: EvaluatedLetter[][]): Record<string, LetterState> {
  const map: Record<string, LetterState> = {}
  const priority: Record<LetterState, number> = { correct: 3, present: 2, absent: 1 }
  for (const row of guesses) {
    for (const { letter, state } of row) {
      if (!map[letter] || priority[state] > priority[map[letter]]) {
        map[letter] = state
      }
    }
  }
  return map
}

function loadGameState(mode: GameMode): SavedGameState | null {
  try {
    const raw = localStorage.getItem(getStateKey(mode))
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveGameState(mode: GameMode, state: SavedGameState) {
  localStorage.setItem(getStateKey(mode), JSON.stringify(state))
}

function initState(mode: GameMode): GameState {
  const settings = loadSettings()
  const saved = loadGameState(mode)
  const today = getTodayString()

  // Check if saved state is still valid
  if (saved) {
    if (mode === 'daily') {
      // Daily mode: valid only if same day
      if (saved.date === today) {
        return {
          mode,
          answer: saved.answer,
          guesses: saved.guesses,
          currentGuess: '',
          gameStatus: saved.gameStatus,
          hardMode: saved.hardMode,
          tenTriesMode: saved.tenTriesMode,
          puzzleNumber: getDailyNumber(),
          usedLetters: buildUsedLetters(saved.guesses),
          toastMessage: null,
          shakeRow: false,
          revealRow: null,
        }
      }
    } else {
      // Unlimited: restore if game is still in progress
      if (saved.gameStatus === 'playing') {
        return {
          mode,
          answer: saved.answer,
          guesses: saved.guesses,
          currentGuess: '',
          gameStatus: saved.gameStatus,
          hardMode: saved.hardMode,
          tenTriesMode: saved.tenTriesMode,
          puzzleNumber: 0,
          usedLetters: buildUsedLetters(saved.guesses),
          toastMessage: null,
          shakeRow: false,
          revealRow: null,
        }
      }
    }
  }

  // Fresh game
  const answer = mode === 'daily' ? getDailyWord() : getRandomWord()
  const freshState: GameState = {
    mode,
    answer,
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    hardMode: settings.hardMode,
    tenTriesMode: settings.tenTriesMode,
    puzzleNumber: mode === 'daily' ? getDailyNumber() : 0,
    usedLetters: {},
    toastMessage: null,
    shakeRow: false,
    revealRow: null,
  }

  saveGameState(mode, {
    date: mode === 'daily' ? today : undefined,
    answer,
    guesses: [],
    gameStatus: 'playing',
    hardMode: settings.hardMode,
    tenTriesMode: settings.tenTriesMode,
  })

  return freshState
}

export function useGameState(initialMode: GameMode = 'daily') {
  // Load saved mode preference, but allow initialMode to override if provided
  const savedSettings = loadSettings()
  const startMode = initialMode === 'daily' ? savedSettings.mode : initialMode
  
  const [state, setState] = useState<GameState>(() => initState(startMode))

  // Switch mode and save preference
  const setMode = useCallback((mode: GameMode) => {
    saveGameModeSetting(mode)
    setState(initState(mode))
  }, [])

  // Persist whenever guesses or status change
  useEffect(() => {
    saveGameState(state.mode, {
      date: state.mode === 'daily' ? getTodayString() : undefined,
      answer: state.answer,
      guesses: state.guesses,
      gameStatus: state.gameStatus,
      hardMode: state.hardMode,
      tenTriesMode: state.tenTriesMode,
    })
  }, [state.guesses, state.gameStatus, state.mode, state.answer, state.hardMode, state.tenTriesMode])

  const addLetter = useCallback((letter: string) => {
    setState(prev => {
      if (prev.gameStatus !== 'playing') return prev
      if (prev.currentGuess.length >= WORD_LENGTH) return prev
      return { ...prev, currentGuess: prev.currentGuess + letter.toLowerCase(), shakeRow: false }
    })
  }, [])

  const removeLetter = useCallback(() => {
    setState(prev => {
      if (prev.gameStatus !== 'playing') return prev
      if (prev.currentGuess.length === 0) return prev
      return { ...prev, currentGuess: prev.currentGuess.slice(0, -1), shakeRow: false }
    })
  }, [])

  const submitGuess = useCallback(() => {
    setState(prev => {
      if (prev.gameStatus !== 'playing') return prev
      if (prev.currentGuess.length !== WORD_LENGTH) {
        return { ...prev, toastMessage: 'Not enough letters', shakeRow: true }
      }

      const guess = prev.currentGuess.toLowerCase()

      // Check if valid word
      if (!VALID_GUESSES.has(guess) && !ANSWER_WORDS.includes(guess)) {
        return { ...prev, toastMessage: 'Not in word list', shakeRow: true }
      }

      // Hard mode validation
      if (prev.hardMode && prev.guesses.length > 0) {
        const error = validateHardMode(guess, prev.guesses)
        if (error) {
          return { ...prev, toastMessage: error, shakeRow: true }
        }
      }

      // Evaluate
      const evaluated = evaluateGuess(guess, prev.answer)
      const newGuesses = [...prev.guesses, evaluated]
      const newUsedLetters = buildUsedLetters(newGuesses)

      // Check win/loss
      const isWin = evaluated.every(l => l.state === 'correct')
      const maxGuesses = prev.tenTriesMode ? 10 : 6
      const isLoss = !isWin && newGuesses.length >= maxGuesses

      let newStatus: GameStatus = 'playing'
      let toastMessage: string | null = null

      if (isWin) {
        newStatus = 'won'
        const messages = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!']
        toastMessage = messages[Math.min(newGuesses.length - 1, messages.length - 1)]
        recordResult(prev.mode, newGuesses.length, getTodayString())
      } else if (isLoss) {
        newStatus = 'lost'
        toastMessage = prev.answer.toUpperCase()
        recordResult(prev.mode, null, getTodayString())
      }

      return {
        ...prev,
        guesses: newGuesses,
        currentGuess: '',
        gameStatus: newStatus,
        usedLetters: newUsedLetters,
        toastMessage,
        shakeRow: false,
        revealRow: newGuesses.length - 1,
      }
    })
  }, [])

  const clearToast = useCallback(() => {
    setState(prev => ({ ...prev, toastMessage: null }))
  }, [])

  const clearShake = useCallback(() => {
    setState(prev => ({ ...prev, shakeRow: false }))
  }, [])

  const clearRevealRow = useCallback(() => {
    setState(prev => ({ ...prev, revealRow: null }))
  }, [])

  const toggleHardMode = useCallback(() => {
    setState(prev => {
      if (prev.guesses.length > 0 && prev.gameStatus === 'playing') {
        return { ...prev, toastMessage: 'Hard mode can only be changed at the start of a game' }
      }
      const newHardMode = !prev.hardMode
      saveHardModeSetting(newHardMode)
      return { ...prev, hardMode: newHardMode }
    })
  }, [])

  const toggleTenTriesMode = useCallback(() => {
    setState(prev => {
      if (prev.guesses.length > 0 && prev.gameStatus === 'playing') {
        return { ...prev, toastMessage: '10 tries mode can only be changed at the start of a game' }
      }
      const newTenTriesMode = !prev.tenTriesMode
      saveTenTriesSetting(newTenTriesMode)
      return { ...prev, tenTriesMode: newTenTriesMode }
    })
  }, [])

  const newGame = useCallback(() => {
    if (state.mode === 'daily') {
      // Daily: re-init (will start fresh if date changed, or restore current)
      setState(initState('daily'))
    } else {
      // Unlimited: always start fresh
      const answer = getRandomWord()
      const settings = loadSettings()
      const fresh: GameState = {
        mode: 'unlimited',
        answer,
        guesses: [],
        currentGuess: '',
        gameStatus: 'playing',
        hardMode: settings.hardMode,
        tenTriesMode: settings.tenTriesMode,
        puzzleNumber: 0,
        usedLetters: {},
        toastMessage: null,
        shakeRow: false,
        revealRow: null,
      }
      saveGameState('unlimited', {
        answer,
        guesses: [],
        gameStatus: 'playing',
        hardMode: settings.hardMode,
        tenTriesMode: settings.tenTriesMode,
      })
      setState(fresh)
    }
  }, [state.mode])

  /** Reset the current game (abandon in-progress, or restart after win/loss) */
  const resetGame = useCallback(() => {
    const answer = state.mode === 'daily' ? getDailyWord() : getRandomWord()
    const settings = loadSettings()
    const fresh: GameState = {
      mode: state.mode,
      answer,
      guesses: [],
      currentGuess: '',
      gameStatus: 'playing',
      hardMode: settings.hardMode,
      tenTriesMode: settings.tenTriesMode,
      puzzleNumber: state.mode === 'daily' ? getDailyNumber() : 0,
      usedLetters: {},
      toastMessage: null,
      shakeRow: false,
      revealRow: null,
    }
    saveGameState(state.mode, {
      date: state.mode === 'daily' ? getTodayString() : undefined,
      answer,
      guesses: [],
      gameStatus: 'playing',
      hardMode: settings.hardMode,
      tenTriesMode: settings.tenTriesMode,
    })
    setState(fresh)
  }, [state.mode])

  /** Reset ALL data: clear all localStorage and reinitialize */
  const resetAll = useCallback(() => {
    localStorage.removeItem('wordle-daily-state')
    localStorage.removeItem('wordle-unlimited-state')
    localStorage.removeItem('wordle-stats-daily')
    localStorage.removeItem('wordle-stats-unlimited')
    localStorage.removeItem('wordle-settings')
    setState(initState(state.mode))
  }, [state.mode])

  return {
    ...state,
    addLetter,
    removeLetter,
    submitGuess,
    clearToast,
    clearShake,
    clearRevealRow,
    toggleHardMode,
    toggleTenTriesMode,
    setMode,
    newGame,
    resetGame,
    resetAll,
  }
}
