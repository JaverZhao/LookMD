import { useMemo, useRef, useEffect } from 'react'
import { renderMarkdown } from '../../lib/markdown'
import { highlightCode } from '../../lib/highlight'
import { useTheme } from '../../hooks/useTheme'
import type { ReaderSettings } from '../../types/settings'

interface MarkdownViewerProps {
  content: string
  filePath?: string
  searchQuery?: string
  searchCurrentMatch?: number
  onMatchInfo?: (total: number) => void
  settings: ReaderSettings
}

function highlightInHtml(html: string, query: string): { html: string; count: number } {
  if (!query) return { html, count: 0 }

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(escaped, 'gi')
  let count = 0

  const result = html.replace(
    /(>|^)([^<]+)(?=<|$)/g,
    (_, prefix: string, text: string) => {
      const highlighted = text.replace(regex, (match) => {
        count++
        return `<mark class="search-highlight">${match}</mark>`
      })
      return prefix + highlighted
    }
  )

  return { html: result, count }
}

export function MarkdownViewer({
  content,
  filePath,
  searchQuery,
  searchCurrentMatch,
  onMatchInfo,
  settings,
}: MarkdownViewerProps) {
  const { resolved } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(0)

  const baseHtml = useMemo(() => renderMarkdown(content, filePath), [content, filePath])

  const { html: highlightedHtml, count } = useMemo(
    () => highlightInHtml(baseHtml, searchQuery ?? ''),
    [baseHtml, searchQuery]
  )

  useEffect(() => {
    if (count !== prevCountRef.current) {
      prevCountRef.current = count
      onMatchInfo?.(count)
    }
  }, [count, onMatchInfo])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const preElements = container.querySelectorAll('pre.code-block')
    if (preElements.length === 0) return

    const tasks: Promise<void>[] = []

    preElements.forEach((pre) => {
      const codeEl = pre.querySelector('code')
      if (!codeEl) return

      const rawCode = codeEl.textContent ?? ''
      const lang = (pre as HTMLElement).dataset.lang ?? ''

      const task = highlightCode(rawCode.trimEnd(), lang, resolved === 'dark').then(
        (highlighted) => {
          pre.outerHTML = highlighted
        }
      )
      tasks.push(task)
    })

    Promise.all(tasks).catch(() => {})
  }, [baseHtml, resolved])

  useEffect(() => {
    if (!searchQuery) return
    const container = containerRef.current
    if (!container) return

    const allMarks = container.querySelectorAll<HTMLElement>('mark.search-highlight')
    const currentIdx = searchCurrentMatch ?? 0

    allMarks.forEach((m, i) => {
      if (i === currentIdx) {
        m.style.backgroundColor = '#f97316'
        m.style.color = '#fff'
        m.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        m.style.backgroundColor = '#fbbf24'
        m.style.color = '#111827'
      }
    })
  }, [searchQuery, searchCurrentMatch, count])

  const containerStyle = useMemo(() => {
    const maxWidth = settings.contentWidth === 'auto' ? '100%' : `${settings.contentWidth}px`
    return {
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}%`,
      lineHeight: `${settings.lineHeight}%`,
      maxWidth,
    }
  }, [settings])

  return (
    <div
      ref={containerRef}
      className="md-content w-full mx-auto px-8 py-8"
      style={containerStyle}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
    />
  )
}
