import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '@/App'
import { ThemeProvider } from '@/context/ThemeContext'

// Mock the virtual:pwa-register/react module
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}))

function renderApp() {
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}

describe('App', () => {
  it('renders without crashing', () => {
    renderApp()
    expect(screen.getByText('My Wordle')).toBeInTheDocument()
  })

  it('renders the keyboard with Enter and Backspace', () => {
    renderApp()
    expect(screen.getByText('Enter')).toBeInTheDocument()
    // Backspace is an SVG icon, check by aria-label
    expect(screen.getByLabelText('backspace')).toBeInTheDocument()
  })

  it('renders Daily and Unlimited mode buttons', () => {
    renderApp()
    expect(screen.getByText('Daily')).toBeInTheDocument()
    expect(screen.getByText('Unlimited')).toBeInTheDocument()
  })

  it('renders QWERTY keyboard keys', () => {
    renderApp()
    // Keys are rendered lowercase, styled uppercase via CSS
    for (const letter of ['q', 'w', 'e', 'r', 't', 'y', 'a', 's', 'z', 'm']) {
      expect(screen.getByText(letter)).toBeInTheDocument()
    }
  })
})
