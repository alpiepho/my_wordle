import Modal from './Modal'

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

export default function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="How To Play">
      <div className="space-y-4 text-sm">
        <p>Guess the <strong>WORDLE</strong> in 6 tries.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Each guess must be a valid 5-letter word.</li>
          <li>The color of the tiles will change to show how close your guess was to the word.</li>
        </ul>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="font-bold mb-2">Examples</p>

          <div className="space-y-3">
            <div>
              <div className="flex gap-1 mb-1">
                <ExampleTile letter="W" state="correct" />
                <ExampleTile letter="E" />
                <ExampleTile letter="A" />
                <ExampleTile letter="R" />
                <ExampleTile letter="Y" />
              </div>
              <p><strong>W</strong> is in the word and in the correct spot.</p>
            </div>

            <div>
              <div className="flex gap-1 mb-1">
                <ExampleTile letter="P" />
                <ExampleTile letter="I" state="present" />
                <ExampleTile letter="L" />
                <ExampleTile letter="L" />
                <ExampleTile letter="S" />
              </div>
              <p><strong>I</strong> is in the word but in the wrong spot.</p>
            </div>

            <div>
              <div className="flex gap-1 mb-1">
                <ExampleTile letter="V" />
                <ExampleTile letter="A" />
                <ExampleTile letter="G" />
                <ExampleTile letter="U" state="absent" />
                <ExampleTile letter="E" />
              </div>
              <p><strong>U</strong> is not in the word in any spot.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="font-bold mb-2">Modes</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Daily:</strong> Everyone gets the same word each day. One puzzle per day.</li>
            <li><strong>Unlimited:</strong> Play as many games as you want with random words.</li>
          </ul>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="font-bold mb-2">Hard Mode</p>
          <p>Any revealed hints must be used in subsequent guesses. Can be toggled in Settings before starting a game.</p>
        </div>
      </div>
    </Modal>
  )
}

function ExampleTile({ letter, state }: { letter: string; state?: 'correct' | 'present' | 'absent' }) {
  const colorClass = (() => {
    switch (state) {
      case 'correct': return 'bg-[var(--color-correct)] border-[var(--color-correct)] text-white'
      case 'present': return 'bg-[var(--color-present)] border-[var(--color-present)] text-white'
      case 'absent': return 'bg-[var(--color-absent)] border-[var(--color-absent)] text-white'
      default: return 'border-gray-300 dark:border-gray-600'
    }
  })()

  return (
    <div className={`w-10 h-10 border-2 flex items-center justify-center text-lg font-bold uppercase ${colorClass}`}>
      {letter}
    </div>
  )
}
