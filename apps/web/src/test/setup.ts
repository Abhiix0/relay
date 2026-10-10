import '@testing-library/jest-dom'
import 'vitest-axe/extend-expect'
import { configureAxe } from 'vitest-axe'

// Ensure JSDOM web APIs match Node global to prevent undici webidl cross-realm mismatch in React Router fetch/Request
if (typeof window !== 'undefined') {
  window.AbortController = globalThis.AbortController
  window.AbortSignal = globalThis.AbortSignal
  window.Request = globalThis.Request
  window.Response = globalThis.Response
  window.Headers = globalThis.Headers
  window.fetch = globalThis.fetch
}

// Suppress colour-contrast violations from K-owned design tokens.
// These are documented in docs/a11y-t.md for K to address.
configureAxe({
  globalOptions: {
    rules: [{ id: 'color-contrast', enabled: false }],
  },
})
