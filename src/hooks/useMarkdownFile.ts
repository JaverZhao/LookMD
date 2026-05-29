import { useState, useCallback } from 'react'
import type { MarkdownFile } from '../types/file'
import { openMarkdownFile, readMarkdownFile } from '../lib/file'

export type AppStatus = 'ready' | 'loading' | 'error'

export function useMarkdownFile() {
  const [file, setFile] = useState<MarkdownFile | null>(null)
  const [status, setStatus] = useState<AppStatus>('ready')
  const [error, setError] = useState<string | null>(null)

  const openFile = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const result = await openMarkdownFile()
      if (result) {
        setFile(result)
        setStatus('ready')
        return result
      }
      setStatus('ready')
      return null
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : '文件打开失败')
      return null
    }
  }, [])

  const readFile = useCallback(async (path: string) => {
    setStatus('loading')
    setError(null)
    try {
      const result = await readMarkdownFile(path)
      setFile(result)
      setStatus('ready')
      return result
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : '文件读取失败')
      return null
    }
  }, [])

  const clearFile = useCallback(() => {
    setFile(null)
    setStatus('ready')
    setError(null)
  }, [])

  return { file, status, error, openFile, readFile, clearFile }
}
