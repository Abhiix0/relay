import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useOnlineStatus } from './useOnlineStatus'

describe('useOnlineStatus', () => {
  let originalNavigator: Navigator

  beforeEach(() => {
    originalNavigator = global.navigator
    // Mock navigator.onLine
    Object.defineProperty(global, 'navigator', {
      value: { onLine: true },
      writable: true,
    })
  })

  afterEach(() => {
    global.navigator = originalNavigator
    vi.clearAllMocks()
  })

  it('returns true when online', () => {
    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(true)
  })

  it('returns false when offline', () => {
    Object.defineProperty(global.navigator, 'onLine', {
      value: false,
      writable: true,
    })

    const { result } = renderHook(() => useOnlineStatus())
    expect(result.current).toBe(false)
  })

  it('responds to online/offline events', () => {
    const { result } = renderHook(() => useOnlineStatus())
    
    expect(result.current).toBe(true)

    // Simulate going offline
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current).toBe(false)

    // Simulate coming back online
    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current).toBe(true)
  })
})