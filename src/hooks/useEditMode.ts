import { useState, useCallback, useRef } from 'react'

interface HistoryEntry {
  content: string
}

const MAX_HISTORY = 100

export function useEditMode(initialContent: string) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(initialContent)
  const historyRef = useRef<HistoryEntry[]>([{ content: initialContent }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [historyLength, setHistoryLength] = useState(1)

  const startEditing = useCallback(() => {
    setContent(initialContent)
    historyRef.current = [{ content: initialContent }]
    setHistoryIndex(0)
    setHistoryLength(1)
    setIsEditing(true)
  }, [initialContent])

  const stopEditing = useCallback(() => {
    setIsEditing(false)
  }, [])

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent)
    const history = historyRef.current
    const current = history[historyIndex]
    if (current.content === newContent) return

    const trimmed = history.slice(0, historyIndex + 1)
    trimmed.push({ content: newContent })
    if (trimmed.length > MAX_HISTORY) trimmed.shift()

    const newIndex = trimmed.length - 1
    historyRef.current = trimmed
    setHistoryIndex(newIndex)
    setHistoryLength(trimmed.length)
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    setContent(historyRef.current[newIndex].content)
  }, [historyIndex])

  const redo = useCallback(() => {
    if (historyIndex >= historyRef.current.length - 1) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    setContent(historyRef.current[newIndex].content)
  }, [historyIndex])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < historyLength - 1
  const isModified = content !== initialContent

  return {
    isEditing,
    content,
    canUndo,
    canRedo,
    isModified,
    startEditing,
    stopEditing,
    updateContent,
    undo,
    redo,
  }
}
