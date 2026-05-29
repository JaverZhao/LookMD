import { useCallback, useEffect, useState } from 'react'
import type { ThemeMode } from '../types/settings'
import { getStorageItem, setStorageItem } from '../lib/storage'

const STORAGE_KEY = 'md-reader-theme'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTheme()
  return mode
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() =>
    getStorageItem<ThemeMode>(STORAGE_KEY, 'system')
  )

  const applyTheme = useCallback((themeMode: ThemeMode) => {
    const resolved = resolveTheme(themeMode)
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [])

  useEffect(() => {
    applyTheme(mode)
    setStorageItem(STORAGE_KEY, mode)
  }, [mode, applyTheme])

  useEffect(() => {
    if (mode !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode, applyTheme])

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const current = resolveTheme(prev)
      const next = current === 'dark' ? 'light' : 'dark'
      return next as ThemeMode
    })
  }, [])

  const resolved = resolveTheme(mode)

  return { mode, resolved, setMode, toggleTheme }
}
