import { useMemo } from 'react'
import type { TocItem } from '../types/markdown'
import { slugify } from '../lib/markdown'

export function useToc(content: string | null): TocItem[] {
  return useMemo(() => {
    if (!content) return []

    const headingRegex = /^(#{1,3})\s+(.+)$/gm
    const headings: TocItem[] = []
    const seen = new Map<string, number>()
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length as 1 | 2 | 3
      const text = match[2].trim()
      if (!text) continue

      const baseId = slugify(text)
      const count = seen.get(baseId) ?? 0
      const id = count > 0 ? `${baseId}-${count}` : baseId
      seen.set(baseId, count + 1)

      headings.push({ id, text, level })
    }

    return headings
  }, [content])
}
