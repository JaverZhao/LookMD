import { useState, useEffect } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { MarkdownFile } from '../../types/file'
import type { AppStatus } from '../../hooks/useMarkdownFile'
import type { RecentFileItem } from '../../types/file'
import type { TocItem } from '../../types/markdown'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'
import { MarkdownViewer } from '../markdown/MarkdownViewer'
import { Toast } from '../ui/Toast'
import { isMarkdownFile } from '../../lib/file'

interface AppShellProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  file: MarkdownFile | null
  status: AppStatus
  error: string | null
  onOpenFile: () => void
  onOpenPath: (path: string) => Promise<void>
  onRecentClick: (path: string) => void
  onRecentRemove: (path: string) => void
  recentFiles: RecentFileItem[]
  tocItems: TocItem[]
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
  onSearchMatchInfo: (total: number) => void
}

export function AppShell({
  theme,
  onToggleTheme,
  file,
  status,
  error,
  onOpenFile,
  onOpenPath,
  onRecentClick,
  onRecentRemove,
  recentFiles,
  tocItems,
  searchProps,
  onSearchMatchInfo,
}: AppShellProps) {
  const [dragOver, setDragOver] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'info' } | null>(null)

  useEffect(() => {
    const appWindow = getCurrentWindow()
    const unlisten = appWindow.onDragDropEvent((event) => {
      const { type } = event.payload

      if (type === 'over') {
        setDragOver(true)
      } else if (type === 'leave') {
        setDragOver(false)
      } else if (type === 'drop') {
        setDragOver(false)
        const paths = event.payload.paths as string[]
        if (paths.length === 0) return

        const firstPath = paths[0]
        if (!isMarkdownFile(firstPath)) {
          setToast({ message: '仅支持 .md / .markdown / .mdown 格式文件', type: 'error' })
          return
        }

        onOpenPath(firstPath)
      }
    })

    return () => {
      unlisten.then((fn) => fn())
    }
  }, [onOpenPath])

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        theme={theme}
        onToggleTheme={onToggleTheme}
        fileName={file?.name}
        onOpenFile={onOpenFile}
        searchProps={searchProps}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          recentFiles={recentFiles}
          onRecentClick={onRecentClick}
          onRecentRemove={onRecentRemove}
          tocItems={tocItems}
        />

        <main
          className={`flex-1 overflow-y-auto flex relative ${file ? 'items-start' : 'items-center justify-center'}`}
          style={{
            backgroundColor: 'var(--color-bg-primary)',
          }}
        >
          {dragOver && (
            <div
              className="absolute inset-0 z-40 flex items-center justify-center rounded-2xl m-4 border-2 border-dashed"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                borderColor: 'var(--color-accent)',
              }}
            >
              <p className="text-lg font-medium" style={{ color: 'var(--color-accent)' }}>
                释放文件以打开
              </p>
            </div>
          )}

          {file ? (
            <MarkdownViewer
              content={file.content}
              filePath={file.path}
              searchQuery={searchProps.query}
              searchCurrentMatch={searchProps.currentMatch}
              onMatchInfo={onSearchMatchInfo}
            />
          ) : (
            <div className="text-center max-w-md px-8">
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                欢迎使用 LookMD
              </h2>
              <p
                className="text-sm mb-6"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                打开或拖入一个 Markdown 文件开始阅读
              </p>
              <button
                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors duration-150 cursor-pointer"
                style={{ backgroundColor: 'var(--color-accent)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-accent)'
                }}
                onClick={onOpenFile}
              >
                打开文件
              </button>
              {status === 'loading' && (
                <p className="text-sm mt-4" style={{ color: 'var(--color-text-tertiary)' }}>
                  正在加载...
                </p>
              )}
              {error && (
                <p className="text-sm mt-4" style={{ color: '#ef4444' }}>
                  {error}
                </p>
              )}
            </div>
          )}
        </main>
      </div>

      <StatusBar file={file} status={status} />

      <Toast
        message={toast?.message ?? null}
        type={toast?.type}
        onDismiss={() => setToast(null)}
      />
    </div>
  )
}
