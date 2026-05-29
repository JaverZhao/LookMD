import { open } from '@tauri-apps/plugin-dialog'
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import type { MarkdownFile } from '../types/file'

const MARKDOWN_EXTENSIONS = ['.md', '.markdown', '.mdown']

export function isMarkdownFile(path: string): boolean {
  const lower = path.toLowerCase()
  return MARKDOWN_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

export async function openMarkdownFile(): Promise<MarkdownFile | null> {
  const selected = await open({
    multiple: false,
    filters: [
      {
        name: 'Markdown',
        extensions: ['md', 'markdown', 'mdown'],
      },
    ],
  })

  if (!selected) return null

  const path = selected as string

  if (!isMarkdownFile(path)) {
    throw new Error('所选文件不是 Markdown 格式')
  }

  return readMarkdownFile(path)
}

export async function readMarkdownFile(path: string): Promise<MarkdownFile> {
  const content = await readTextFile(path)
  const name = path.split('\\').pop() ?? path

  return {
    path,
    name,
    content,
    lastOpenedAt: Date.now(),
  }
}

export async function saveMarkdownFile(path: string, content: string): Promise<void> {
  await writeTextFile(path, content)
}
