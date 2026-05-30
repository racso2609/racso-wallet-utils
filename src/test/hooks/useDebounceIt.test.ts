import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import useDebounceIt from '../../hooks/utils/useDebounceIt'

describe('useDebounceIt', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() =>
      useDebounceIt({ value: 'hello', delay: 0.5 }),
    )
    expect(result.current).toBe('hello')
  })

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounceIt({ value, delay: 0.5 }),
      { initialProps: { value: 'first' } },
    )

    expect(result.current).toBe('first')

    rerender({ value: 'second' })
    expect(result.current).toBe('first')

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('second')
  })

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounceIt({ value, delay: 1 }),
      { initialProps: { value: 'a' } },
    )

    rerender({ value: 'b' })
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('a')

    rerender({ value: 'c' })
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('c')
  })
})
