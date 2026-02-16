# My Wordle

A vibe-coded Wordle clone — PWA that works offline, with daily and unlimited modes.

- Vibe coded with Copilot / Agent / Claude Opus 4.6
- Modeled after [app-fire-calculator](https://github.com/jamesmontemagno/app-fire-calculator) for PWA patterns
- React 19, TypeScript, Vite, Tailwind CSS 4

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- npm (comes with Node)

### Install Dependencies

```bash
npm install
```

### Development

Start the dev server with hot-reload:

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173).

### Testing

```bash
npm test              # run all tests once
npm run test:watch    # run tests in watch mode
npm run test:coverage # run tests with coverage report
```

### Local Production Preview

Build the app and preview the production bundle locally:

```bash
npm run build    # compile TypeScript & build for production
npm run preview  # serve the dist/ folder locally
```

The preview server runs at [http://localhost:4173/my_wordle/](http://localhost:4173/my_wordle/).  
This is the closest you can get to testing the real production build (including PWA service worker) without deploying.

### Deploy to GitHub Pages

```bash
npm run deploy
```

This runs `build` automatically, then pushes `dist/` to the `gh-pages` branch.

## Project Structure

```
src/
  components/      # React UI components
    game/          #   Board, Tile, Keyboard, Toast
    layout/        #   Header
    modals/        #   Help, Stats, Settings modals
  context/         # ThemeContext (dark mode, high contrast)
  data/            # Word lists (answers + valid guesses)
  hooks/           # Game state, stats, keyboard input
  utils/           # Game engine (evaluate, daily word, hard mode, share)
  __tests__/       # App integration tests
public/            # Static assets (favicon, 404, robots.txt)
```

## Initial Prompt

Using Copilot/Agent/Opus 4.6

- We want a new application that plays the popular game Wordle.
- We don't know the current rules, but since this is popular, there should be good examples on the web, please research
- We want this as a simple PWA app
- We can use the app-fire-calculator as a good example of creating a PWA
- source code is in samples/app-fire-calculator
- Provide a brief overview of the project structure and implementation
- Please ask clarifying questions
- Please generate an implementation plan for this new app

