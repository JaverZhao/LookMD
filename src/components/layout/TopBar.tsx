import { useEffect } from 'react'
import { Sun, Moon, FileUp, Search, Settings, PenLine } from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { SearchBox } from '../search/SearchBox'

interface TopBarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  fileName?: string
  onOpenFile: () => void
  onOpenSettings: () => void
  isEditing: boolean
  onToggleEdit: () => void
  hasFile: boolean
  searchProps: {
    query: string
    isOpen: boolean
    currentMatch: number
    totalMatches: number
    inputRef: React.RefObject<HTMLInputElement | null>
    onQueryChange: (value: string) => void
    onClose: () => void
    onNext: () => void
    onPrev: () => void
    open: () => void
  }
}

export function TopBar({ theme, onToggleTheme, fileName, onOpenFile, onOpenSettings, isEditing, onToggleEdit, hasFile, searchProps }: TopBarProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        searchProps.open()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [searchProps])

  return (
    <header
      className="flex items-center justify-between h-12 px-4 border-b select-none"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="text-sm font-semibold flex-shrink-0"
          style={{ color: 'var(--color-text-primary)' }}
        >
          LookMD
        </span>
        {fileName && (
          <>
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                color: 'var(--color-text-tertiary)',
                backgroundColor: 'var(--color-bg-primary)',
              }}
            >
              /
            </span>
            <span
              className="text-sm truncate"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {fileName}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        <SearchBox
          query={searchProps.query}
          isOpen={searchProps.isOpen}
          currentMatch={searchProps.currentMatch}
          totalMatches={searchProps.totalMatches}
          inputRef={searchProps.inputRef}
          onQueryChange={searchProps.onQueryChange}
          onClose={searchProps.onClose}
          onNext={searchProps.onNext}
          onPrev={searchProps.onPrev}
        />
        <IconButton onClick={searchProps.open} tooltip="搜索 (Ctrl+F)">
          <Search size={18} />
        </IconButton>
        {hasFile && (
          <IconButton onClick={onToggleEdit} tooltip={isEditing ? '退出编辑' : '编辑'}>
            <PenLine size={18} />
          </IconButton>
        )}
        <IconButton onClick={onOpenFile} tooltip="打开文件">
          <FileUp size={18} />
        </IconButton>
        <IconButton onClick={onOpenSettings} tooltip="阅读与编辑设置">
          <Settings size={18} />
        </IconButton>
        <IconButton onClick={onToggleTheme} tooltip="切换主题">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>
      </div>
    </header>
  )
}
