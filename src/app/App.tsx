import { useCallback } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useMarkdownFile } from '../hooks/useMarkdownFile'
import { useRecentFiles } from '../hooks/useRecentFiles'
import { useToc } from '../hooks/useToc'
import { useFileSearch } from '../hooks/useFileSearch'
import { useReaderSettings } from '../hooks/useReaderSettings'
import { useEditMode } from '../hooks/useEditMode'
import { saveMarkdownFile } from '../lib/file'
import { AppShell } from '../components/layout/AppShell'

function App() {
  const { resolved, toggleTheme } = useTheme()
  const { file, status, error, openFile, readFile } = useMarkdownFile()
  const { recentFiles, addRecent, removeRecent } = useRecentFiles()
  const tocItems = useToc(file?.content ?? null)
  const search = useFileSearch()
  const { settings, updateSetting, resetSettings } = useReaderSettings()
  const edit = useEditMode(file?.content ?? '')

  const handleOpenFile = useCallback(async () => {
    const result = await openFile()
    if (result) {
      addRecent(result)
    }
  }, [openFile, addRecent])

  const handleOpenPath = useCallback(
    async (path: string) => {
      const result = await readFile(path)
      if (result) {
        addRecent(result)
      }
    },
    [readFile, addRecent]
  )

  const handleRecentClick = useCallback(
    async (path: string) => {
      const result = await readFile(path)
      if (result) {
        addRecent(result)
      }
    },
    [readFile, addRecent]
  )

  const handleSearchMatchInfo = useCallback(
    (total: number) => {
      search.setMatchInfo(total)
    },
    [search]
  )

  const handleSave = useCallback(
    async (path: string, content: string) => {
      await saveMarkdownFile(path, content)
      await readFile(path)
    },
    [readFile]
  )

  return (
    <AppShell
      theme={resolved}
      onToggleTheme={toggleTheme}
      file={file}
      status={status}
      error={error}
      onOpenFile={handleOpenFile}
      onOpenPath={handleOpenPath}
      onRecentClick={handleRecentClick}
      onRecentRemove={removeRecent}
      recentFiles={recentFiles}
      tocItems={tocItems}
      searchProps={{
        query: search.query,
        isOpen: search.isOpen,
        currentMatch: search.currentMatch,
        totalMatches: search.totalMatches,
        inputRef: search.inputRef,
        onQueryChange: search.updateQuery,
        onClose: search.close,
        onNext: search.nextMatch,
        onPrev: search.prevMatch,
        open: search.open,
      }}
      onSearchMatchInfo={handleSearchMatchInfo}
      settings={settings}
      onUpdateSetting={updateSetting}
      onResetSettings={resetSettings}
      editProps={{
        isEditing: edit.isEditing,
        editContent: edit.content,
        canUndo: edit.canUndo,
        canRedo: edit.canRedo,
        isModified: edit.isModified,
        onStartEditing: edit.startEditing,
        onStopEditing: edit.stopEditing,
        onEditContentChange: edit.updateContent,
        onUndo: edit.undo,
        onRedo: edit.redo,
        onSave: handleSave,
      }}
    />
  )
}

export default App
