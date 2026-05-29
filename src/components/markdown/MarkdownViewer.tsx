import { useMemo, useRef, useEffect, useCallback } from 'react'
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

export function MarkdownViewer({
  content,
  filePath,
  searchQuery,
  searchCurrentMatch,
  onMatchInfo,
  settings,
}: MarkdownViewerProps) {
  const { resolved } = useTheme()
  const html = useMemo(() => renderMarkdown(content, filePath), [content, filePath])
  const containerRef = useRef<HTMLDivElement>(null)

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
  }, [html, resolved])

  const highlightSearch = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const marks = container.querySelectorAll('mark.search-highlight')
    marks.forEach((m) => {
      const parent = m.parentNode
      if (parent) {
        parent.replaceChild(document.createTextNode(m.textContent ?? ''), m)
        parent.normalize()
      }
    })

    if (!searchQuery) {
      onMatchInfo?.(0)
      return
    }

    const query = searchQuery.toLowerCase()
    const treeWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []
    while (treeWalker.nextNode()) {
      textNodes.push(treeWalker.currentNode as Text)
    }

    const matches: { node: Text; offset: number }[] = []
    for (const node of textNodes) {
      const text = node.textContent?.toLowerCase() ?? ''
      let idx = 0
      while ((idx = text.indexOf(query, idx)) !== -1) {
        matches.push({ node, offset: idx })
        idx += query.length
      }
    }

    onMatchInfo?.(matches.length)

    if (matches.length === 0) return

    for (const { node, offset } of matches) {
      const range = document.createRange()
      range.setStart(node, offset)
      range.setEnd(node, offset + query.length)

      const mark = document.createElement('mark')
      mark.className = 'search-highlight'
      mark.style.backgroundColor = '#fbbf24'
      mark.style.color = '#111827'
      mark.style.borderRadius = '2px'
      mark.style.padding = '0 1px'

      try {
        range.surroundContents(mark)
      } catch {
        const fragment = range.extractContents()
        mark.appendChild(fragment)
        range.insertNode(mark)
      }
    }

    const allMarks = container.querySelectorAll('mark.search-highlight')
    const currentIdx = searchCurrentMatch ?? 0
    if (currentIdx >= 0 && currentIdx < allMarks.length) {
      allMarks.forEach((m, i) => {
        if (i === currentIdx) {
          ;(m as HTMLElement).style.backgroundColor = '#f97316'
          ;(m as HTMLElement).style.color = '#fff'
          m.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else {
          ;(m as HTMLElement).style.backgroundColor = '#fbbf24'
          ;(m as HTMLElement).style.color = '#111827'
        }
      })
    }
  }, [searchQuery, searchCurrentMatch, onMatchInfo])

  useEffect(() => {
    highlightSearch()
  }, [highlightSearch])

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
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
