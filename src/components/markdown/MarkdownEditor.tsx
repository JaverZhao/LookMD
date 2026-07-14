import { useRef, useEffect, useCallback } from 'react'
import {
  Bold,
  Braces,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Strikethrough,
} from 'lucide-react'
import type { ReaderSettings } from '../../types/settings'
import { renderEditableMarkdown } from '../../lib/markdown'
import { sanitizeHtml } from '../../lib/sanitize'
import { editableHtmlToMarkdown } from '../../lib/wysiwyg'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  settings: ReaderSettings
  filePath?: string
  scrollRatio?: number
  onScrollRatioChange?: (ratio: number) => void
}

interface EditorSurfaceProps extends MarkdownEditorProps {
  scrollRatio: number
}

function getScrollRatio(element: HTMLElement): number {
  const { scrollTop, scrollHeight, clientHeight } = element
  return scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0
}

function SourceEditor({ content, onChange, settings, scrollRatio, onScrollRatioChange }: EditorSurfaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const restoredRef = useRef(false)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== 'Tab') return

      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      onChange(`${content.substring(0, start)}  ${content.substring(end)}`)
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      })
    },
    [content, onChange]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.focus()
    if (!restoredRef.current && scrollRatio > 0) {
      restoredRef.current = true
      textarea.selectionStart = textarea.selectionEnd = Math.floor(content.length * scrollRatio)
      textarea.scrollTop = (textarea.scrollHeight - textarea.clientHeight) * scrollRatio
    }
  }, [content, scrollRatio])

  return (
    <textarea
      ref={textareaRef}
      value={content}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onScroll={(e) => onScrollRatioChange?.(getScrollRatio(e.currentTarget))}
      spellCheck={false}
      aria-label="Markdown 源码编辑器"
      className="w-full h-full resize-none outline-none border-none p-8 leading-relaxed"
      style={{
        fontFamily: '"JetBrains Mono", "Consolas", monospace',
        fontSize: `${settings.fontSize}%`,
        lineHeight: `${settings.lineHeight}%`,
        color: 'var(--color-text-primary)',
        backgroundColor: 'var(--color-bg-primary)',
      }}
    />
  )
}

interface ToolbarButtonProps {
  label: string
  onPress: () => void
  children: React.ReactNode
}

function ToolbarButton({ label, onPress, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-150 hover:bg-[var(--color-bg-tertiary)]"
      style={{ color: 'var(--color-text-secondary)' }}
      onMouseDown={(e) => {
        e.preventDefault()
        onPress()
      }}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <span className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--color-border-primary)' }} />
}

function WysiwygEditor({ content, onChange, settings, filePath, scrollRatio, onScrollRatioChange }: EditorSurfaceProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const lastEmittedRef = useRef<string | null>(null)
  const restoredRef = useRef(false)

  const emitMarkdown = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return

    const markdown = editableHtmlToMarkdown(editor.innerHTML)
    lastEmittedRef.current = markdown
    onChange(markdown)
  }, [onChange])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    if (content === lastEmittedRef.current) {
      lastEmittedRef.current = null
      return
    }

    editor.innerHTML = renderEditableMarkdown(content, filePath) || '<p><br></p>'
  }, [content, filePath])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    editor.focus()
    if (!restoredRef.current && scrollRatio > 0) {
      restoredRef.current = true
      requestAnimationFrame(() => {
        editor.scrollTop = (editor.scrollHeight - editor.clientHeight) * scrollRatio
      })
    }
  }, [scrollRatio])

  const runCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    emitMarkdown()
  }, [emitMarkdown])

  const insertLink = useCallback(() => {
    const url = window.prompt('请输入链接地址')?.trim()
    if (!url || /^\s*(?:javascript|data|vbscript):/i.test(url)) return

    editorRef.current?.focus()
    const selection = window.getSelection()?.toString() ?? ''
    if (selection) {
      document.execCommand('createLink', false, url)
    } else {
      const escaped = url
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
      document.execCommand('insertHTML', false, `<a href="${escaped}">${escaped}</a>`)
    }
    emitMarkdown()
  }, [emitMarkdown])

  const maxWidth = settings.contentWidth === 'auto' ? '100%' : `${settings.contentWidth}px`

  return (
    <div className="w-full h-full min-h-0 flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div
        className="flex items-center flex-wrap gap-0.5 px-4 py-2 border-b flex-shrink-0"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border-primary)',
        }}
        role="toolbar"
        aria-label="格式工具栏"
      >
        <ToolbarButton label="正文" onPress={() => runCommand('formatBlock', 'p')}><Pilcrow size={16} /></ToolbarButton>
        <ToolbarButton label="一级标题" onPress={() => runCommand('formatBlock', 'h1')}><Heading1 size={16} /></ToolbarButton>
        <ToolbarButton label="二级标题" onPress={() => runCommand('formatBlock', 'h2')}><Heading2 size={16} /></ToolbarButton>
        <ToolbarButton label="三级标题" onPress={() => runCommand('formatBlock', 'h3')}><Heading3 size={16} /></ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="粗体 (Ctrl+B)" onPress={() => runCommand('bold')}><Bold size={16} /></ToolbarButton>
        <ToolbarButton label="斜体 (Ctrl+I)" onPress={() => runCommand('italic')}><Italic size={16} /></ToolbarButton>
        <ToolbarButton label="删除线" onPress={() => runCommand('strikeThrough')}><Strikethrough size={16} /></ToolbarButton>
        <ToolbarButton label="代码块" onPress={() => runCommand('formatBlock', 'pre')}><Code2 size={16} /></ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="无序列表" onPress={() => runCommand('insertUnorderedList')}><List size={16} /></ToolbarButton>
        <ToolbarButton label="有序列表" onPress={() => runCommand('insertOrderedList')}><ListOrdered size={16} /></ToolbarButton>
        <ToolbarButton label="引用" onPress={() => runCommand('formatBlock', 'blockquote')}><Quote size={16} /></ToolbarButton>
        <ToolbarButton label="插入链接" onPress={insertLink}><Link size={16} /></ToolbarButton>
        <span className="ml-auto flex items-center gap-1.5 text-xs px-2" style={{ color: 'var(--color-text-tertiary)' }}>
          <Braces size={14} />
          所见即所得
        </span>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        aria-label="所见即所得 Markdown 编辑器"
        className="md-content wysiwyg-editor w-full flex-1 min-h-0 overflow-y-auto mx-auto px-8 py-8 outline-none"
        style={{
          fontFamily: settings.fontFamily,
          fontSize: `${settings.fontSize}%`,
          lineHeight: `${settings.lineHeight}%`,
          maxWidth,
          color: 'var(--color-text-primary)',
          backgroundColor: 'var(--color-bg-primary)',
        }}
        onInput={emitMarkdown}
        onScroll={(e) => onScrollRatioChange?.(getScrollRatio(e.currentTarget))}
        onKeyDown={(e) => {
          if (e.key !== 'Tab') return
          e.preventDefault()
          const element = window.getSelection()?.anchorNode?.parentElement
          document.execCommand(element?.closest('li') ? (e.shiftKey ? 'outdent' : 'indent') : 'insertText', false, '  ')
          emitMarkdown()
        }}
        onPaste={(e) => {
          const html = e.clipboardData.getData('text/html')
          if (!html) return
          e.preventDefault()
          document.execCommand('insertHTML', false, sanitizeHtml(html))
          emitMarkdown()
        }}
      />
    </div>
  )
}

export function MarkdownEditor({ content, onChange, settings, filePath, scrollRatio = 0, onScrollRatioChange }: MarkdownEditorProps) {
  const props = { content, onChange, settings, filePath, scrollRatio, onScrollRatioChange }

  return settings.editorMode === 'wysiwyg'
    ? <WysiwygEditor {...props} />
    : <SourceEditor {...props} />
}
