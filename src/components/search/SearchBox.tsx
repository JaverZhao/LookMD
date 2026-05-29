import { useEffect, useCallback } from 'react'
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'

interface SearchBoxProps {
  query: string
  isOpen: boolean
  currentMatch: number
  totalMatches: number
  inputRef: React.RefObject<HTMLInputElement | null>
  onQueryChange: (value: string) => void
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

export function SearchBox({
  query,
  isOpen,
  currentMatch,
  totalMatches,
  inputRef,
  onQueryChange,
  onClose,
  onNext,
  onPrev,
}: SearchBoxProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.key === 'Enter') {
        e.shiftKey ? onPrev() : onNext()
      }
    },
    [onClose, onNext, onPrev]
  )

  useEffect(() => {
    if (!isOpen) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg border"
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <Search size={14} style={{ color: 'var(--color-text-tertiary)' }} />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="搜索..."
        className="w-40 bg-transparent text-sm outline-none border-none"
        style={{ color: 'var(--color-text-primary)' }}
      />
      {query && (
        <span className="text-xs whitespace-nowrap" style={{ color: 'var(--color-text-tertiary)' }}>
          {totalMatches > 0
            ? `${currentMatch + 1} / ${totalMatches}`
            : '0 / 0'}
        </span>
      )}
      {query && (
        <>
          <button
            className="flex items-center justify-center w-5 h-5 rounded cursor-pointer"
            style={{ color: 'var(--color-text-tertiary)' }}
            onClick={onPrev}
          >
            <ChevronUp size={14} />
          </button>
          <button
            className="flex items-center justify-center w-5 h-5 rounded cursor-pointer"
            style={{ color: 'var(--color-text-tertiary)' }}
            onClick={onNext}
          >
            <ChevronDown size={14} />
          </button>
        </>
      )}
      <button
        className="flex items-center justify-center w-5 h-5 rounded cursor-pointer"
        style={{ color: 'var(--color-text-tertiary)' }}
        onClick={onClose}
      >
        <X size={14} />
      </button>
    </div>
  )
}
