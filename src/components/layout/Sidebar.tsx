import { useState } from 'react'
import { History, ListTree } from 'lucide-react'
import type { RecentFileItem } from '../../types/file'
import type { TocItem } from '../../types/markdown'
import { MarkdownToc } from '../markdown/MarkdownToc'

type SidebarTab = 'recent' | 'toc'

interface SidebarProps {
  recentFiles: RecentFileItem[]
  onRecentClick: (path: string) => void
  onRecentRemove: (path: string) => void
  tocItems: TocItem[]
}

export function Sidebar({ recentFiles, onRecentClick, onRecentRemove, tocItems }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('toc')

  return (
    <aside
      className="w-[280px] flex-shrink-0 border-r flex flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <div
        className="flex border-b"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors duration-150 cursor-pointer ${
            activeTab === 'toc' ? '' : 'opacity-50 hover:opacity-80'
          }`}
          style={{
            color: activeTab === 'toc' ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
            borderBottom: activeTab === 'toc' ? '2px solid var(--color-accent)' : '2px solid transparent',
          }}
          onClick={() => setActiveTab('toc')}
        >
          <ListTree size={14} />
          目录大纲
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors duration-150 cursor-pointer ${
            activeTab === 'recent' ? '' : 'opacity-50 hover:opacity-80'
          }`}
          style={{
            color: activeTab === 'recent' ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
            borderBottom: activeTab === 'recent' ? '2px solid var(--color-accent)' : '2px solid transparent',
          }}
          onClick={() => setActiveTab('recent')}
        >
          <History size={14} />
          最近文件
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'toc' && (
          <div className="h-full overflow-y-auto p-4">
            <MarkdownToc items={tocItems} />
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="h-full overflow-y-auto p-4">
            {recentFiles.length === 0 ? (
              <div
                className="flex items-center justify-center h-24 text-sm rounded-lg"
                style={{
                  color: 'var(--color-text-tertiary)',
                  backgroundColor: 'var(--color-bg-primary)',
                }}
              >
                暂无打开文件
              </div>
            ) : (
              <ul className="space-y-1">
                {recentFiles.map((file) => (
                  <li key={file.path} className="group flex items-center">
                    <button
                      className="flex-1 text-left text-sm py-1.5 px-2 rounded-lg truncate transition-colors duration-150 cursor-pointer"
                      style={{ color: 'var(--color-text-secondary)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                      onClick={() => onRecentClick(file.path)}
                    >
                      {file.name}
                    </button>
                    <button
                      className="opacity-0 group-hover:opacity-100 text-xs px-1.5 py-1 rounded transition-opacity cursor-pointer"
                      style={{ color: 'var(--color-text-tertiary)' }}
                      onClick={() => onRecentRemove(file.path)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
