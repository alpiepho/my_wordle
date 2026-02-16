# Wordle Clone PWA — Implementation Plan

## Overview

A Wordle clone built as a Progressive Web App (PWA) using React 19, TypeScript, Vite, and Tailwind CSS 4. Modeled after the PWA patterns in `samples/app-fire-calculator`. Deployable to GitHub Pages with a simple manual `npm run deploy` command.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript ~5.9 | Type safety |
| Vite 7 | Build tool & dev server |
| Tailwind CSS 4 | Styling (utility-first, dark mode) |
| vite-plugin-pwa | Service worker, manifest, offline caching |
| gh-pages | One-command deploy to GitHub Pages |
| Vitest | Unit & integration testing (Vite-native, fast) |
| @testing-library/react | Component rendering & interaction tests |
| @testing-library/user-event | Realistic keyboard/click event simulation |
| jsdom | Browser environment for Vitest |
| @vitest/coverage-v8 | Code coverage reporting |

---

## Project Structure

```
samples/app-wordle/
├── index.html                  # Entry HTML with PWA meta tags & theme-flash script
├── package.json
├── tsconfig.json
├── vite.config.ts              # Vite + PWA plugin + path aliases
├── public/
│   ├── 404.html                # GitHub Pages SPA redirect trick
│   ├── robots.txt
│   └── icons/                  # PWA icons (192×192, 512×512)
└── src/
    ├── main.tsx                # createRoot entry, ThemeProvider wrap
    ├── index.css               # Tailwind import, Inter font, global styles
    ├── vite-env.d.ts
    ├── App.tsx                 # Top-level layout, routing between views
    ├── components/
    │   ├── game/
    │   │   ├── Board.tsx       # 5×6 tile grid
    │   │   ├── Tile.tsx        # Single letter tile (flip animation, color states)
    │   │   ├── Keyboard.tsx    # On-screen QWERTY keyboard
    │   │   └── Toast.tsx       # Transient notification messages
    │   ├── modals/
    │   │   ├── StatsModal.tsx  # Statistics display (per-mode)
    │   │   ├── SettingsModal.tsx # Dark mode, hard mode, high-contrast toggles
    │   │   └── HelpModal.tsx   # How-to-play instructions
    │   ├── layout/
    │   │   └── Header.tsx      # App bar with title, icons for help/stats/settings
    │   └── UpdatePrompt.tsx    # PWA update toast (reuse pattern from fire-calculator)
    ├── context/
    │   └── ThemeContext.tsx     # Dark mode + high-contrast mode provider
    ├── data/
    │   ├── words.ts            # Bundled answer word list (~2,300 words)
    │   ├── validGuesses.ts     # Extended list of acceptable guess words (~10,000)
    │   └── README.md           # Instructions for updating word lists
    ├── hooks/
    │   ├── useGameState.ts     # Core game state machine & persistence
    │   ├── useKeyboard.ts      # Physical keyboard event listener
    │   └── useStats.ts         # Read/write statistics from localStorage
    └── utils/
        ├── evaluateGuess.ts    # Per-letter color evaluation (green/yellow/gray)
        ├── dailyWord.ts        # Deterministic daily word selection
        └── share.ts            # Emoji grid generation & clipboard copy
```

---

## Phase 1 — Scaffold & PWA Foundation

### 1.1 Initialize project

- Create `samples/app-wordle/` with `package.json` mirroring fire-calculator dependencies (minus Recharts/ExcelJS, plus `gh-pages`).
- Copy and adapt `vite.config.ts`:
  - Base URL: `'/app-wordle/'` (or repo name for GitHub Pages).
  - PWA manifest: name "Wordle", theme color green (#6aaa64), Wordle-themed icons.
  - Workbox: `globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']`.
  - Register type: `'prompt'`.
- Copy and adapt `tsconfig.json` (same strict settings, path alias `@/*` → `src/*`).

### 1.2 Entry point & shell

- `index.html` — PWA meta tags, `theme-color`, apple-touch-icon, theme-flash-prevention inline script, GitHub Pages SPA redirect script.
- `src/main.tsx` — `createRoot`, wrap in `ThemeProvider`.
- `src/App.tsx` — Single-page layout: `<Header>`, `<Board>`, `<Keyboard>`, modals, toasts.
- `src/index.css` — Tailwind 4 import, Inter font, custom CSS for tile flip animation and keyboard button styles.

### 1.3 PWA update prompt

- `src/components/UpdatePrompt.tsx` — Reuse the `useRegisterSW` pattern from fire-calculator. Show "New version available" toast with Refresh/Later buttons.

### 1.4 GitHub Pages deploy

- Add `gh-pages` as a dev dependency.
- Add script: `"deploy": "npm run build && gh-pages -d dist"`.
- Create `public/404.html` with redirect-to-query-string trick for SPA routing.

---

## Phase 2 — Word Lists (Bundled, Easy to Update)

### 2.1 Answer list — `src/data/words.ts`

```ts
// Curated list of ~2,300 common 5-letter English words.
// To update: replace or append to this array.
// Source: public domain Wordle-style word lists.
export const ANSWER_WORDS: string[] = [
  "about", "above", "abuse", /* ... ~2,300 words ... */
];
```

### 2.2 Valid guesses list — `src/data/validGuesses.ts`

```ts
// Extended dictionary of ~10,000 accepted 5-letter words.
// Includes all ANSWER_WORDS plus less-common words.
// Any word in this list is accepted as a guess.
export const VALID_GUESSES: Set<string> = new Set([
  "aahed", "aalii", /* ... ~10,000 words ... */
]);
```

### 2.3 Update instructions — `src/data/README.md`

Document how to:
1. Replace `words.ts` or `validGuesses.ts` with a new array.
2. Run `npm run build && npm run deploy` to push updates.
3. Optionally fetch a remote JSON at build time via a Vite plugin (future enhancement).

---

## Phase 3 — Game Engine

### 3.1 Guess evaluation — `src/utils/evaluateGuess.ts`

Core algorithm for coloring each letter:

1. **First pass**: Mark exact matches as `correct` (green). Track remaining unmatched answer letters in a frequency map.
2. **Second pass**: For non-exact letters, if the letter exists in the frequency map, mark `present` (yellow) and decrement. Otherwise mark `absent` (gray).

This correctly handles **duplicate letters** (e.g., guessing "SPEED" against "ABIDE" — only one E turns yellow).

```ts
export type LetterState = 'correct' | 'present' | 'absent';

export interface EvaluatedLetter {
  letter: string;
  state: LetterState;
}

export function evaluateGuess(guess: string, answer: string): EvaluatedLetter[];
```

### 3.2 Daily word selection — `src/utils/dailyWord.ts`

Deterministic selection using a fixed epoch date so all players get the same word on the same day:

```ts
const EPOCH = new Date('2026-02-16'); // App launch date

export function getDailyWordIndex(): number {
  const now = new Date();
  const diff = Math.floor((now.getTime() - EPOCH.getTime()) / 86_400_000);
  return diff % ANSWER_WORDS.length;
}

export function getDailyWord(): string {
  return ANSWER_WORDS[getDailyWordIndex()];
}
```

### 3.3 Share results — `src/utils/share.ts`

Generate an emoji grid for clipboard sharing:

```
Wordle 42 4/6 🔥

⬜🟨⬜⬜⬜
⬜🟩⬜🟨🟨
🟩🟩🟨⬜🟩
🟩🟩🟩🟩🟩
```

- Use high-contrast emoji variants (🟧🟦) when that mode is active.
- Copy to clipboard via `navigator.clipboard.writeText()`.

---

## Phase 4 — Game State & Persistence

### 4.1 Game state hook — `src/hooks/useGameState.ts`

Central state machine managing:

| State field | Type | Description |
|---|---|---|
| `mode` | `'daily' \| 'unlimited'` | Current play mode |
| `answer` | `string` | The target word |
| `guesses` | `EvaluatedLetter[][]` | Submitted guesses with evaluations |
| `currentGuess` | `string` | Letters typed so far (max 5) |
| `gameStatus` | `'playing' \| 'won' \| 'lost'` | Current game outcome |
| `hardMode` | `boolean` | Whether hard mode rules are enforced |

**Actions:**
- `addLetter(letter: string)` — Append letter if `currentGuess.length < 5`.
- `removeLetter()` — Delete last letter.
- `submitGuess()` — Validate word, enforce hard mode rules, evaluate, check win/loss.
- `newGame()` — Reset for unlimited mode; no-op for daily if already played today.

### 4.2 localStorage schema

```
localStorage keys:
  wordle-daily-state    → { date, answer, guesses, gameStatus }
  wordle-unlimited-state → { answer, guesses, gameStatus }
  wordle-stats-daily    → { gamesPlayed, gamesWon, currentStreak, maxStreak, guessDistribution }
  wordle-stats-unlimited → { gamesPlayed, gamesWon, currentStreak, maxStreak, guessDistribution }
  wordle-settings       → { darkMode, hardMode, highContrast }
```

- Daily state is keyed by date — if the stored date doesn't match today, start a fresh game.
- Unlimited state is overwritten on each new game.
- Stats are **separate** for daily and unlimited modes.

### 4.3 Statistics hook — `src/hooks/useStats.ts`

```ts
interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<1 | 2 | 3 | 4 | 5 | 6, number>;
}
```

- `useStats(mode)` — Returns current stats and an `addResult(guessCount | null)` function.
- Streak logic: daily streak increments only for consecutive calendar days. Unlimited streak increments for consecutive wins.

---

## Phase 5 — UI Components

### 5.1 Header — `src/components/layout/Header.tsx`

- App title "Wordle" centered.
- Left: Help (❓) icon.
- Right: Stats (📊), Settings (⚙️) icons.
- Mode toggle: "Daily" / "Unlimited" switch/tabs.

### 5.2 Board — `src/components/game/Board.tsx`

- Renders a 5×6 grid of `<Tile>` components.
- Filled rows show evaluated guesses with colors.
- Current row shows typed letters without colors.
- Empty rows show blank tiles.
- **Animations**: Tile flip on reveal (CSS `rotateX` with staggered delay per tile), row shake on invalid word, bounce on win.

### 5.3 Tile — `src/components/game/Tile.tsx`

- Props: `letter`, `state` (`idle | tbd | correct | present | absent`), `position` (for animation delay).
- Renders a square with large centered letter.
- Color mapping:
  - Light mode: green `#6aaa64`, yellow `#c9b458`, gray `#787c7e`.
  - Dark mode: green `#538d4e`, yellow `#b59f3b`, gray `#3a3a3c`.
  - High-contrast: orange `#f5793a`, blue `#85c0f9`, gray `#787c7e`.

### 5.4 Keyboard — `src/components/game/Keyboard.tsx`

- Three rows: `QWERTYUIOP`, `ASDFGHJKL`, `⏎ ZXCVBNM ⌫`.
- Each key shows the "best" state from all previous guesses (green > yellow > gray > unused).
- Tapping a key calls `addLetter` / `submitGuess` / `removeLetter`.
- Keys are color-coded to match their state.

### 5.5 Toast — `src/components/game/Toast.tsx`

- Transient top-center message (e.g., "Not in word list", "Not enough letters", "Hard mode: 2nd letter must be R").
- Auto-dismiss after ~1.5 seconds.
- Stack multiple toasts with animation.

### 5.6 Modals

**HelpModal** — Rules with tile color examples.  
**StatsModal** — Games played, win %, current/max streak, guess distribution bar chart, share button (only after game ends), mode tabs (Daily / Unlimited).  
**SettingsModal** — Toggles for: Hard Mode (with warning if mid-game), Dark Theme, High Contrast Mode.

---

## Phase 6 — Keyboard Input

### 6.1 Physical keyboard hook — `src/hooks/useKeyboard.ts`

- `useEffect` with `keydown` listener on `document`.
- Maps `a-z` → `addLetter`, `Enter` → `submitGuess`, `Backspace` → `removeLetter`.
- Disabled when a modal is open or game is over.

### 6.2 On-screen keyboard

- Handled directly in `Keyboard.tsx` via `onClick` handlers.
- Both input methods feed into the same `useGameState` actions.

---

## Phase 7 — Hard Mode

### Rules

When hard mode is enabled, each guess must use **all previously revealed hints**:

1. Any letter marked **green** in a prior guess must appear in the **same position** in subsequent guesses.
2. Any letter marked **yellow** in a prior guess must appear **somewhere** in subsequent guesses.

### Implementation

In `submitGuess()`, before evaluating:

```ts
function validateHardMode(guess: string, previousGuesses: EvaluatedLetter[][]): string | null {
  for (const prev of previousGuesses) {
    for (let i = 0; i < 5; i++) {
      if (prev[i].state === 'correct' && guess[i] !== prev[i].letter) {
        return `Position ${i + 1} must be ${prev[i].letter.toUpperCase()}`;
      }
      if (prev[i].state === 'present' && !guess.includes(prev[i].letter)) {
        return `Guess must contain ${prev[i].letter.toUpperCase()}`;
      }
    }
  }
  return null; // valid
}
```

- If validation fails, show a toast with the reason and do not consume a guess.
- Hard mode can only be toggled **before the first guess** of a game. If mid-game, show a warning toast and block the toggle.

---

## Phase 8 — Themes & Accessibility

### 8.1 Dark mode — `src/context/ThemeContext.tsx`

- Class-based dark mode: toggle `.dark` on `<html>`.
- Persisted in `wordle-settings.darkMode`.
- Theme-flash-prevention inline script in `index.html` (same pattern as fire-calculator).

### 8.2 High-contrast (colorblind) mode

- Stored in `wordle-settings.highContrast`.
- Adds `.high-contrast` class to `<html>`.
- CSS custom properties swap green/yellow to orange/blue:
  ```css
  :root { --color-correct: #6aaa64; --color-present: #c9b458; }
  .dark { --color-correct: #538d4e; --color-present: #b59f3b; }
  .high-contrast { --color-correct: #f5793a; --color-present: #85c0f9; }
  ```

---

## Phase 9 — Deploy to GitHub Pages

### Setup (one-time)

1. Install: `npm install --save-dev gh-pages`.
2. Set `base` in `vite.config.ts` to `'/<repo-name>/'` (e.g., `'/my_wordle/'`).
3. Add to `package.json` scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
4. Create `public/404.html` with the SPA redirect trick.

### Deploy workflow

```bash
npm run deploy
```

That's it. This will:
1. Run `tsc && vite build` (type-check + production build).
2. Push the `dist/` folder to the `gh-pages` branch.
3. GitHub Pages serves from that branch automatically.

No CI/CD pipeline needed. Just run the command locally whenever you want to ship.

---

## Testing Strategy

Every phase includes tests written alongside the implementation. Tests live next to the code they test using a `__tests__/` directory or `.test.ts` / `.test.tsx` co-located files.

### Test Infrastructure (set up in Phase 1)

- **Vitest** as the test runner (zero-config with Vite, same transform pipeline).
- **jsdom** environment for component tests.
- **@testing-library/react** + **@testing-library/user-event** for DOM interaction.
- **@vitest/coverage-v8** for coverage reports.
- Scripts in `package.json`:
  ```json
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
  ```
- `vitest.config.ts` (or inline in `vite.config.ts`) with `environment: 'jsdom'`, path aliases, and `setupFiles` for Testing Library matchers (`@testing-library/jest-dom`).

### Tests by Phase

#### Phase 1 — Scaffold & PWA
| Test | Type | What it verifies |
|---|---|---|
| Smoke test | Unit | `App.tsx` renders without crashing |
| PWA manifest | Manual | Dev tools → Application tab shows correct manifest |
| Build succeeds | Script | `npm run build` exits cleanly (covered by `predeploy`) |

#### Phase 2 — Word Lists
| Test | Type | What it verifies |
|---|---|---|
| Answer list integrity | Unit | All words are exactly 5 lowercase alpha characters |
| Answer list size | Unit | List has ≥ 2,000 words |
| Valid guesses superset | Unit | Every answer word is also in the valid guesses set |
| No duplicates | Unit | No duplicate entries in either list |

#### Phase 3 — Game Engine
| Test | Type | What it verifies |
|---|---|---|
| Basic correct guess | Unit | All letters → `correct` when guess = answer |
| Basic absent guess | Unit | All letters → `absent` when no letters match |
| Mixed states | Unit | Correct, present, and absent in same word |
| Duplicate letter — one match | Unit | "SPEED" vs "ABIDE" → only one E is `present` |
| Duplicate letter — both match | Unit | "GEESE" vs "GREET" → correct duplicate handling |
| Daily word determinism | Unit | Same date always returns the same word index |
| Daily word changes | Unit | Different dates return different indices |
| Share string format | Unit | Output matches `Wordle N X/6` + emoji grid format |
| High-contrast share | Unit | Uses 🟧🟦 instead of 🟩🟨 |

#### Phase 4 — Game State & Persistence
| Test | Type | What it verifies |
|---|---|---|
| Initial state | Unit | Fresh game has 0 guesses, status `playing` |
| Add/remove letter | Unit | `currentGuess` grows/shrinks correctly |
| Max 5 letters | Unit | `addLetter` is no-op at length 5 |
| Submit valid guess | Unit | Guess is evaluated and appended to `guesses` |
| Reject invalid word | Unit | Word not in dictionary → toast, no guess consumed |
| Win detection | Unit | Correct guess → status `won` |
| Loss detection | Unit | 6 wrong guesses → status `lost`, answer revealed |
| localStorage save | Integration | State round-trips through save/load |
| Daily state reset | Integration | Stale date triggers fresh game |
| Stats increment | Unit | Win increments `gamesWon`, updates distribution |
| Streak logic (daily) | Unit | Consecutive calendar-day wins grow streak |
| Streak break | Unit | Skipping a day resets `currentStreak` to 0 |
| Separate mode stats | Integration | Daily and unlimited stats are independent |

#### Phase 5 — UI Components
| Test | Type | What it verifies |
|---|---|---|
| Board renders 30 tiles | Component | 5 × 6 = 30 `Tile` elements present |
| Tile shows letter | Component | Tile with `letter="A"` renders "A" |
| Tile color classes | Component | `state="correct"` applies green class |
| Keyboard renders 26+ keys | Component | All alpha keys + Enter + Backspace present |
| Keyboard key state | Component | Used letters show correct color class |
| Keyboard click fires action | Component | Clicking "A" calls `addLetter("a")` |
| Toast appears and auto-hides | Component | Toast is visible then removed after timeout |
| Header mode toggle | Component | Clicking toggle switches between Daily/Unlimited |

#### Phase 6 — Keyboard Input
| Test | Type | What it verifies |
|---|---|---|
| Letter key adds letter | Integration | Pressing `a` key adds "a" to current guess |
| Enter submits guess | Integration | Pressing `Enter` triggers `submitGuess` |
| Backspace removes letter | Integration | Pressing `Backspace` triggers `removeLetter` |
| Disabled after game over | Integration | Keys are ignored when `gameStatus !== 'playing'` |
| Disabled when modal open | Integration | Keys are ignored when a modal is visible |

#### Phase 7 — Hard Mode
| Test | Type | What it verifies |
|---|---|---|
| Green position enforced | Unit | Guess missing a known green letter → error message |
| Yellow inclusion enforced | Unit | Guess missing a known yellow letter → error message |
| Valid hard mode guess passes | Unit | Guess using all hints → `null` (no error) |
| Multiple hints combined | Unit | Both green and yellow constraints checked together |
| Mid-game toggle blocked | Integration | Cannot enable hard mode after first guess |

#### Phase 8 — Themes & Accessibility
| Test | Type | What it verifies |
|---|---|---|
| Dark mode class toggle | Component | `.dark` is added/removed on `<html>` |
| High-contrast colors | Component | `.high-contrast` swaps CSS custom properties |
| Settings persist | Integration | Toggling dark mode survives page reload (localStorage) |

#### Phase 9 — Deploy
| Test | Type | What it verifies |
|---|---|---|
| Full test suite passes | Script | `npm test` exits cleanly |
| Production build succeeds | Script | `npm run build` exits cleanly |
| 404.html redirect | Manual | Navigate to a sub-route directly → app loads correctly |
| Offline mode | Manual | Disable network → app loads from service worker cache |
| PWA install | Manual | "Add to Home Screen" prompt works on mobile |

### Coverage Goal

- **≥ 90% coverage** on `utils/` and `hooks/` (pure logic, easy to test).
- **≥ 70% coverage** on `components/` (focus on interaction behavior, not pixel-perfect rendering).
- Run `npm run test:coverage` before each deploy to verify.

---

## Implementation Order (Recommended)

| Step | Phase | Description | Tests | Est. Effort |
|---|---|---|---|---|
| 1 | Phase 1 | Scaffold project, PWA config, deploy pipeline | Smoke test, Vitest config, `npm test` runs | Small |
| 2 | Phase 2 | Bundle word lists | Word list integrity & superset tests | Small |
| 3 | Phase 3 | Game engine (evaluateGuess, dailyWord) | 9 unit tests covering all evaluation edge cases | Medium |
| 4 | Phase 4 | Game state hook + localStorage persistence | State machine + persistence integration tests | Medium |
| 5 | Phase 5.2–5.4 | Board, Tile, Keyboard components | Component render & interaction tests | Medium |
| 6 | Phase 6 | Keyboard input (physical + on-screen) | Keyboard event integration tests | Small |
| 7 | Phase 5.1, 5.5 | Header, Toasts | Component render tests | Small |
| 8 | Phase 7 | Hard mode validation | 5 unit tests for constraint enforcement | Small |
| 9 | Phase 4.2–4.3 | Dual-mode stats + StatsModal | Stats persistence + modal component tests | Medium |
| 10 | Phase 5.6 | Help, Settings modals | Component render + toggle interaction tests | Small |
| 11 | Phase 8 | Dark mode, high-contrast mode | Theme toggle + CSS class assertion tests | Small |
| 12 | Phase 3.3 | Share results (emoji grid) | Share string format unit tests | Small |
| 13 | Phase 9 | Final deploy & test | Full suite pass, coverage check, manual PWA tests | Small |

---

## Open Questions / Future Enhancements

- **Animations**: CSS-only (simpler) or Framer Motion (richer)? *Recommend CSS-only for v1.*
- **Word-of-the-day sync**: Currently deterministic per client clock. Could add a simple API later for server-synced words.
- **Multiplayer / leaderboard**: Out of scope for v1 but the stats schema is extensible.
- **Custom word length**: Could generalize to 4–7 letter variants as a future mode.
