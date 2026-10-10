import '@testing-library/jest-dom'
import 'vitest-axe/extend-expect'

// Ensure JSDOM web APIs match Node global to prevent undici webidl cross-realm mismatch in React Router fetch/Request
if (typeof window !== 'undefined') {
  window.AbortController = globalThis.AbortController
  window.AbortSignal = globalThis.AbortSignal
  window.Request = globalThis.Request
  window.Response = globalThis.Response
  window.Headers = globalThis.Headers
  window.fetch = globalThis.fetch
}

