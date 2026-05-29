import { useState, useCallback, useEffect } from 'react'
import type { ReaderSettings } from '../types/settings'
import { getStorageItem, setStorageItem } from '../lib/storage'

const STORAGE_KEY = 'lookmd-reader-settings'

const DEFAULTS: ReaderSettings = {
  fontFamily: 'Inter, "Microsoft YaHei", "PingFang SC", system-ui, sans-serif',
  fontSize: 100,
  lineHeight: 170,
  contentWidth: 900,
  themeColor: '#3b82f6',
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  }
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function lighten(hex: string, factor: number) {
  const { r, g, b } = hexToRgb(hex)
  const lerp = (a: number, t: number) => a + (255 - a) * t
  return rgbToHex(lerp(r, factor), lerp(g, factor), lerp(b, factor))
}

function darken(hex: string, factor: number) {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex(r * (1 - factor), g * (1 - factor), b * (1 - factor))
}

function mergeWithDefaults(loaded: Partial<ReaderSettings>): ReaderSettings {
  return { ...DEFAULTS, ...loaded }
}

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    const loaded = getStorageItem<Partial<ReaderSettings>>(STORAGE_KEY, {})
    return mergeWithDefaults(loaded)
  })

  useEffect(() => {
    setStorageItem(STORAGE_KEY, settings)
  }, [settings])

  useEffect(() => {
    const root = document.documentElement
    const color = settings.themeColor
    root.style.setProperty('--color-accent', color)
    root.style.setProperty('--color-accent-hover', darken(color, 0.15))
    root.style.setProperty('--color-accent-dark', lighten(color, 0.35))
    root.style.setProperty('--color-accent-hover-dark', lighten(color, 0.15))
  }, [settings.themeColor])

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
