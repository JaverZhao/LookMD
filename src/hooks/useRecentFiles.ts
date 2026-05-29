import { useState, useCallback, useEffect } from 'react'
import type { RecentFileItem } from '../types/file'
import { getStorageItem, setStorageItem } from '../lib/storage'

const STORAGE_KEY = 'md-reader-recent-files'
const MAX_ITEMS = 20

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<RecentFileItem[]>(() =>
    getStorageItem<RecentFileItem[]>(STORAGE_KEY, [])
  )

  useEffect(() => {
    setStorageItem(STORAGE_KEY, recentFiles)
  }, [recentFiles])

  const addRecent = useCallback((file: { path: string; name: string; lastOpenedAt: number }) => {
    setRecentFiles((prev) => {
      const filtered = prev.filter((item) => item.path !== file.path)
      return [{ path: file.path, name: file.name, lastOpenedAt: file.lastOpenedAt }, ...filtered].slice(0, MAX_ITEMS)
    })
  }, [])

  const removeRecent = useCallback((path: string) => {
    setRecentFiles((prev) => prev.filter((item) => item.path !== path))
  }, [])

  return { recentFiles, addRecent, removeRecent }
}
