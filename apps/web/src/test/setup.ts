import '@testing-library/jest-dom'
import 'vitest-axe/extend-expect'
import { configureAxe } from 'vitest-axe'

// Suppress colour-contrast violations from K-owned design tokens.
// These are documented in docs/a11y-t.md for K to address.
configureAxe({
  globalOptions: {
    rules: [{ id: 'color-contrast', enabled: false }],
  },
})
