import { useRef, useEffect, useCallback } from 'react'
import type { ReaderSettings } from '../../types/settings'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  settings: ReaderSettings
  scrollRatio?: number
}

export function MarkdownEditor({ content, onChange, settings, scrollRatio = 0 }: MarkdownEditorProps) {
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
