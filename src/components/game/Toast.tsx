import { useEffect, useState } from 'react'

interface ToastProps {
  message: string | null
  duration?: number
  onDone: () => void
  /** Keep visible (e.g., game over message stays until dismissed) */
  persist?: boolean
}

export default function Toast({ message, duration = 1500, onDone, persist }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<string | null>(null)

  useEffect(() => {
    if (message) {
      setCurrentMessage(message)
      setVisible(true)
      setExiting(false)

      if (!persist) {
        const exitTimer = setTimeout(() => setExiting(true), duration)
        const removeTimer = setTimeout(() => {
          setVisible(false)
          setCurrentMessage(null)
          onDone()
        }, duration + 200)

        return () => {
          clearTimeout(exitTimer)
          clearTimeout(removeTimer)
        }
      }
    }
  }, [message, duration, onDone, persist])

  if (!visible || !currentMessage) return null

  return (
    <div className="fixed top-[10%] left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div
        className={`
          bg-gray-900 dark:bg-gray-100
          text-white dark:text-gray-900
          px-4 py-3 rounded-lg font-bold text-sm
          shadow-lg pointer-events-auto
          ${exiting ? 'toast-exit' : 'toast-enter'}
        `}
      >
        {currentMessage}
      </div>
    </div>
  )
}
