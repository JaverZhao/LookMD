import type { MarkdownFile } from '../../types/file'
import type { AppStatus } from '../../hooks/useMarkdownFile'

interface StatusBarProps {
  file: MarkdownFile | null
  status: AppStatus
}

function countWords(text: string): number {
  const chinese = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const english = text
    .replace(/[\u4e00-\u9fff]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return chinese + english
}

function countLines(text: string): number {
  return text.split('\n').length
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function StatusBar({ file, status }: StatusBarProps) {
  const statusText = () => {
    switch (status) {
      case 'loading': return '加载中…'
      case 'error': return '错误'
      default: return '就绪'
    }
  }

  return (
    <footer
      className="flex items-center justify-between h-7 px-4 border-t text-xs"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border-primary)',
        color: 'var(--color-text-tertiary)',
      }}
    >
      <div className="flex items-center gap-4 truncate">
        {file ? (
          <>
            <span className="truncate max-w-[300px]">{file.path}</span>
            <span>{countWords(file.content)} 字</span>
            <span>{countLines(file.content)} 行</span>
            {file.size && <span>{formatFileSize(file.size)}</span>}
          </>
        ) : (
          <span>就绪</span>
        )}
      </div>
      <span>{statusText()}</span>
    </footer>
  )
}
