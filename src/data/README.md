# Word Lists

## How to update

### Answer words (`words.ts`)
The answer word list contains ~2,300 common 5-letter English words. These are the words that can be chosen as the daily/game answer.

To update:
1. Edit `words.ts` and replace the `ANSWER_WORDS` array.
2. All words must be exactly 5 lowercase letters (`/^[a-z]{5}$/`).
3. No duplicates allowed.
4. Run `npm run build` to verify, then `npm run deploy`.

### Valid guesses (`validGuesses.ts`)
The valid guesses list contains ~10,000 acceptable 5-letter words. Any word in this list (or in the answer list) is accepted as a guess.

To update:
1. Edit `validGuesses.ts` and replace the `VALID_GUESSES_LIST` array.
2. Same format rules as answer words.
3. The answer words are automatically included — you don't need to duplicate them.

### Sources
Word lists are derived from public domain English word frequency data and open-source Wordle-compatible word lists.
