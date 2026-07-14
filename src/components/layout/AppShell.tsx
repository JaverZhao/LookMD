import { useState, useEffect, useCallback, useRef } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { MarkdownFile } from '../../types/file'
import type { AppStatus } from '../../hooks/useMarkdownFile'
import type { RecentFileItem } from '../../types/file'
import type { TocItem } from '../../types/markdown'
import type { ReaderSettings } from '../../types/settings'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'
import { MarkdownViewer } from '../markdown/MarkdownViewer'
import { MarkdownEditor } from '../markdown/MarkdownEditor'
import { SettingsDialog } from '../settings/SettingsDialog'
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
  settings: ReaderSettings
  onUpdateSetting: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void
  onResetSettings: () => void
  editProps: {
    isEditing: boolean
    editContent: string
    canUndo: boolean
    canRedo: boolean
    isModified: boolean
    onStartEditing: () => void
    onStopEditing: () => void
    onEditContentChange: (content: string) => void
    onUndo: () => void
    onRedo: () => void
    onSave: (path: string, content: string) => Promise<void>
  }
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
  settings,
  onUpdateSetting,
  onResetSettings,
  editProps,
}: AppShellProps) {
  const [dragOver, setDragOver] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'info' } | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)
  const [editorScrollRatio, setEditorScrollRatio] = useState(0)
  const [viewerScrollRatio, setViewerScrollRatio] = useState<number | undefined>(undefined)
  const editorScrollRef = useRef(0)

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

  useEffect(() => {
    setViewerScrollRatio(undefined)
  }, [file?.path])

  const handleToggleEdit = useCallback(() => {
    if (editProps.isEditing) {
      setViewerScrollRatio(editorScrollRef.current)
      editProps.onStopEditing()
    } else {
      if (mainRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = mainRef.current
        const ratio = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0
        setEditorScrollRatio(ratio)
      }
      setViewerScrollRatio(undefined)
      editProps.onStartEditing()
    }
  }, [editProps])

  const handleSave = useCallback(async () => {
    if (!file) return
    try {
      await editProps.onSave(file.path, editProps.editContent)
      setToast({ message: '保存成功', type: 'info' })
    } catch {
      setToast({ message: '保存失败', type: 'error' })
    }
  }, [file, editProps])

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        theme={theme}
        onToggleTheme={onToggleTheme}
        fileName={file?.name}
        onOpenFile={onOpenFile}
        onOpenSettings={() => setSettingsOpen(true)}
        isEditing={editProps.isEditing}
        onToggleEdit={handleToggleEdit}
        hasFile={!!file}
        searchProps={searchProps}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          recentFiles={recentFiles}
          onRecentClick={onRecentClick}
          onRecentRemove={onRecentRemove}
          tocItems={tocItems}
          isEditing={editProps.isEditing}
          canUndo={editProps.canUndo}
          canRedo={editProps.canRedo}
          isModified={editProps.isModified}
          onSave={handleSave}
          onUndo={editProps.onUndo}
          onRedo={editProps.onRedo}
          onCancelEdit={() => {
            setViewerScrollRatio(editorScrollRef.current)
            editProps.onStopEditing()
          }}
        />

        <main
          ref={mainRef}
          className={`flex-1 overflow-y-auto flex relative ${file && !editProps.isEditing ? 'items-start' : (file && editProps.isEditing ? '' : 'items-center justify-center')}`}
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

          {file && editProps.isEditing ? (
            <MarkdownEditor
              content={editProps.editContent}
              onChange={editProps.onEditContentChange}
              settings={settings}
              filePath={file.path}
              scrollRatio={editorScrollRatio}
              onScrollRatioChange={(r) => { editorScrollRef.current = r }}
            />
          ) : file ? (
            <MarkdownViewer
              content={file.content}
              filePath={file.path}
              searchQuery={searchProps.query}
              searchCurrentMatch={searchProps.currentMatch}
              onMatchInfo={onSearchMatchInfo}
              settings={settings}
              scrollRatio={viewerScrollRatio}
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

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdate={onUpdateSetting}
        onReset={onResetSettings}
      />

      <Toast
        message={toast?.message ?? null}
        type={toast?.type}
        onDismiss={() => setToast(null)}
      />
    </div>
  )
}
