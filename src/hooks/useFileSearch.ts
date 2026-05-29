import { useState, useCallback, useRef } from 'react'

export function useFileSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [currentMatch, setCurrentMatch] = useState(0)
  const [totalMatches, setTotalMatches] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const open = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setCurrentMatch(0)
    setTotalMatches(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setCurrentMatch(0)
    setTotalMatches(0)
  }, [])

  const updateQuery = useCallback((value: string) => {
    setQuery(value)
    setCurrentMatch(0)
  }, [])

  const setMatchInfo = useCallback((total: number) => {
    setTotalMatches(total)
  }, [])

  const nextMatch = useCallback(() => {
    setCurrentMatch((prev) => Math.min(prev + 1, Math.max(totalMatches - 1, 0)))
  }, [totalMatches])

  const prevMatch = useCallback(() => {
    setCurrentMatch((prev) => Math.max(prev - 1, 0))
  }, [])

  return {
    query,
    isOpen,
    currentMatch,
    totalMatches,
    inputRef,
    open,
    close,
    updateQuery,
    setMatchInfo,
    nextMatch,
    prevMatch,
  }
}
