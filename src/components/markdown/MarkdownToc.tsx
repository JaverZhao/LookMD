import { useCallback } from 'react'
import type { TocItem } from '../../types/markdown'

interface MarkdownTocProps {
  items: TocItem[]
}

export function MarkdownToc({ items }: MarkdownTocProps) {
  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  if (items.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-24 text-sm rounded-lg"
        style={{
          color: 'var(--color-text-tertiary)',
          backgroundColor: 'var(--color-bg-primary)',
        }}
      >
        打开文件后显示目录
      </div>
    )
  }

  return (
    <nav className="space-y-0.5">
      {items.map((item) => (
        <button
          key={item.id}
          className="block w-full text-left text-sm py-1 px-2 rounded-lg truncate transition-colors duration-150 cursor-pointer"
          style={{
            paddingLeft: `${(item.level - 1) * 12 + 8}px`,
            color: 'var(--color-text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
          onClick={() => handleClick(item.id)}
        >
          {item.text}
        </button>
      ))}
    </nav>
  )
}
