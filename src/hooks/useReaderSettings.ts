import { useState, useCallback, useEffect } from 'react'
import type { ReaderSettings } from '../types/settings'
import { getStorageItem, setStorageItem } from '../lib/storage'

const STORAGE_KEY = 'lookmd-reader-settings'

const DEFAULTS: ReaderSettings = {
  fontFamily: 'Inter, "Microsoft YaHei", "PingFang SC", system-ui, sans-serif',
  fontSize: 100,
  lineHeight: 170,
  contentWidth: 900,
}

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(() =>
    getStorageItem<ReaderSettings>(STORAGE_KEY, DEFAULTS)
  )

  useEffect(() => {
    setStorageItem(STORAGE_KEY, settings)
  }, [settings])

  const updateSetting = useCallback(<K extends keyof ReaderSettings>(
    key: K,
    value: ReaderSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULTS)
  }, [])

  return { settings, updateSetting, resetSettings, DEFAULTS }
}
