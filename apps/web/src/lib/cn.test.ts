import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn utility', () => {
  it('combines class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    const shouldInclude = true
    const shouldExclude = false
    expect(cn('base', shouldInclude && 'conditional')).toBe('base conditional')
    expect(cn('base', shouldExclude && 'conditional')).toBe('base')
  })

  it('merges conflicting tailwind classes correctly', () => {
    expect(cn('p-2 p-4')).toBe('p-4')
    expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500')
  })

  it('handles undefined and null values', () => {
    expect(cn('class1', undefined, 'class2', null)).toBe('class1 class2')
  })

  it('handles empty string', () => {
    expect(cn('')).toBe('')
    expect(cn('class1', '', 'class2')).toBe('class1 class2')
  })
})