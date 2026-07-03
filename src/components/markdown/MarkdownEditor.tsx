import { useRef, useEffect, useCallback } from 'react'
import type { ReaderSettings } from '../../types/settings'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  settings: ReaderSettings
  scrollRatio?: number
  onScrollRatioChange?: (ratio: number) => void
}

export function MarkdownEditor({ content, onChange, settings, scrollRatio = 0, onScrollRatioChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const restoredRef = useRef(false)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const ta = e.currentTarget
        const start = ta.selectionStart
        const end = ta.selectionEnd
        const before = content.substring(0, start)
        const after = content.substring(end)
        onChange(`${before}  ${after}`)
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2
        })
      }
    },
    [content, onChange]
  )

  const handleScroll = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    const { scrollTop, scrollHeight, clientHeight } = ta
    const ratio = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0
    onScrollRatioChange?.(ratio)
  }, [onScrollRatioChange])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.focus()

    if (!restoredRef.current && scrollRatio > 0) {
      restoredRef.current = true
      const targetLine = Math.floor(content.length * scrollRatio)
      ta.selectionStart = ta.selectionEnd = targetLine
      ta.scrollTop = (ta.scrollHeight - ta.clientHeight) * scrollRatio
    }
  }, [content, scrollRatio])

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onScroll={handleScroll}
      spellCheck={false}
      className="w-full h-full resize-none outline-none border-none p-8 leading-relaxed"
      style={{
        fontFamily: settings.fontFamily,
        fontSize: `${settings.fontSize}%`,
        lineHeight: `${settings.lineHeight}%`,
        color: 'var(--color-text-primary)',
        backgroundColor: 'var(--color-bg-primary)',
      }}
    />
  )
}
