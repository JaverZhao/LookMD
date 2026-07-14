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
import {
  findBlockInputRule,
  findInlineInputRule,
  type MarkdownBlockRule,
} from '../../lib/editorInputRules'

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

interface AppliedBlockInputRule {
  target: HTMLElement
  container: HTMLElement
  prefix: string
}

function placeCaret(element: HTMLElement, atEnd = false) {
  const selection = window.getSelection()
  if (!selection) return

  const range = document.createRange()
  range.selectNodeContents(element)
  range.collapse(!atEnd)
  selection.removeAllRanges()
  selection.addRange(range)
}

function getCurrentParagraph(editor: HTMLElement): HTMLElement | null {
  const selection = window.getSelection()
  const node = selection?.anchorNode
  if (!selection?.isCollapsed || !node || !editor.contains(node)) return null

  const element = node.nodeType === Node.ELEMENT_NODE
    ? node as HTMLElement
    : node.parentElement
  const paragraph = element?.closest<HTMLElement>('p, div') ?? null
  return paragraph?.parentElement === editor ? paragraph : null
}

function getTextBeforeCaret(block: HTMLElement): string | null {
  const selection = window.getSelection()
  if (!selection?.isCollapsed || !selection.anchorNode || !block.contains(selection.anchorNode)) return null

  const range = document.createRange()
  range.selectNodeContents(block)
  range.setEnd(selection.anchorNode, selection.anchorOffset)
  return range.toString()
}

function createEmptyBlock(tagName: string): HTMLElement {
  const element = document.createElement(tagName)
  element.appendChild(document.createElement('br'))
  return element
}

function applyBlockInputRule(editor: HTMLElement, rule: MarkdownBlockRule): AppliedBlockInputRule | null {
  const paragraph = getCurrentParagraph(editor)
  if (!paragraph || paragraph.textContent !== rule.prefix || getTextBeforeCaret(paragraph) !== rule.prefix) return null

  if (rule.kind === 'heading') {
    const heading = createEmptyBlock(`h${rule.level}`)
    paragraph.replaceWith(heading)
    placeCaret(heading)
    return { target: heading, container: heading, prefix: rule.prefix }
  }

  if (rule.kind === 'bulletList' || rule.kind === 'orderedList') {
    const list = document.createElement(rule.kind === 'bulletList' ? 'ul' : 'ol')
    const item = createEmptyBlock('li')
    list.appendChild(item)
    paragraph.replaceWith(list)
    placeCaret(item)
    return { target: item, container: list, prefix: rule.prefix }
  }

  if (rule.kind === 'blockquote') {
    const blockquote = document.createElement('blockquote')
    const innerParagraph = createEmptyBlock('p')
    blockquote.appendChild(innerParagraph)
    paragraph.replaceWith(blockquote)
    placeCaret(innerParagraph)
    return { target: innerParagraph, container: blockquote, prefix: rule.prefix }
  }

  const codeBlock = createEmptyBlock('pre')
  paragraph.replaceWith(codeBlock)
  placeCaret(codeBlock)
  return { target: codeBlock, container: codeBlock, prefix: rule.prefix }
}

function restoreBlockInputRule(applied: AppliedBlockInputRule): boolean {
  const selection = window.getSelection()
  if (!selection?.isCollapsed || !selection.anchorNode || !applied.target.contains(selection.anchorNode)) return false
  if (applied.target.textContent) return false

  const beforeCaret = document.createRange()
  beforeCaret.selectNodeContents(applied.target)
  beforeCaret.setEnd(selection.anchorNode, selection.anchorOffset)
  if (beforeCaret.toString()) return false

  const paragraph = document.createElement('p')
  paragraph.textContent = applied.prefix
  applied.container.replaceWith(paragraph)
  placeCaret(paragraph, true)
  return true
}

function applyInlineInputRule(editor: HTMLElement): boolean {
  const selection = window.getSelection()
  const textNode = selection?.anchorNode
  if (!selection?.isCollapsed || !textNode || textNode.nodeType !== Node.TEXT_NODE || !editor.contains(textNode)) return false
  if (textNode.parentElement?.closest('pre, code')) return false

  const offset = selection.anchorOffset
  const textBeforeCaret = textNode.textContent?.slice(0, offset) ?? ''
  const rule = findInlineInputRule(textBeforeCaret)
  if (!rule) return false

  const range = document.createRange()
  range.setStart(textNode, rule.start)
  range.setEnd(textNode, offset)
  range.deleteContents()

  const formatted = document.createElement(rule.tagName)
  formatted.textContent = rule.content
  if (rule.tagName === 'a' && rule.href) formatted.setAttribute('href', rule.href)
  range.insertNode(formatted)
  range.setStartAfter(formatted)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
  return true
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
  const composingRef = useRef(false)
  const appliedBlockRuleRef = useRef<AppliedBlockInputRule | null>(null)

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

    appliedBlockRuleRef.current = null
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
    appliedBlockRuleRef.current = null
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    emitMarkdown()
  }, [emitMarkdown])

  const insertLink = useCallback(() => {
    const url = window.prompt('请输入链接地址')?.trim()
    if (!url || /^\s*(?:javascript|data|vbscript):/i.test(url)) return

    appliedBlockRuleRef.current = null
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

  const handleWysiwygInput = useCallback(() => {
    appliedBlockRuleRef.current = null
    if (!composingRef.current && editorRef.current) {
      applyInlineInputRule(editorRef.current)
    }
    emitMarkdown()
  }, [emitMarkdown])

  const handleWysiwygKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const editor = editorRef.current
    if (!editor) return

    if (!composingRef.current && !e.nativeEvent.isComposing && (e.key === ' ' || e.key === 'Enter')) {
      const paragraph = getCurrentParagraph(editor)
      const textBeforeCaret = paragraph ? getTextBeforeCaret(paragraph) : null
      const rule = textBeforeCaret === null ? undefined : findBlockInputRule(textBeforeCaret)
      const canApplyWithKey = e.key === ' ' || rule?.kind === 'codeBlock'

      if (rule && canApplyWithKey) {
        const applied = applyBlockInputRule(editor, rule)
        if (applied) {
          e.preventDefault()
          appliedBlockRuleRef.current = applied
          emitMarkdown()
          return
        }
      }
    }

    if (e.key === 'Backspace' && appliedBlockRuleRef.current) {
      if (restoreBlockInputRule(appliedBlockRuleRef.current)) {
        e.preventDefault()
        appliedBlockRuleRef.current = null
        emitMarkdown()
        return
      }
    }

    if (e.key !== 'Tab') return
    e.preventDefault()
    appliedBlockRuleRef.current = null
    const element = window.getSelection()?.anchorNode?.parentElement
    document.execCommand(element?.closest('li') ? (e.shiftKey ? 'outdent' : 'indent') : 'insertText', false, '  ')
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
        <span
          className="ml-auto flex items-center gap-1.5 text-xs px-2"
          style={{ color: 'var(--color-text-tertiary)' }}
          title="支持 Markdown 快捷输入"
        >
          <Braces size={14} />
          所见即所得 · Markdown 快捷输入
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
        onInput={handleWysiwygInput}
        onScroll={(e) => onScrollRatioChange?.(getScrollRatio(e.currentTarget))}
        onKeyDown={handleWysiwygKeyDown}
        onCompositionStart={() => {
          composingRef.current = true
          appliedBlockRuleRef.current = null
        }}
        onCompositionEnd={() => {
          composingRef.current = false
          if (editorRef.current) applyInlineInputRule(editorRef.current)
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
