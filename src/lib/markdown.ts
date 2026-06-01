import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import { convertFileSrc } from '@tauri-apps/api/core'
import { sanitizeHtml } from './sanitize'

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight: (str, lang) => {
    const langAttr = lang ? ` data-lang="${lang}"` : ''
    const code = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    return `<pre${langAttr} class="code-block"><code>${code}\n</code></pre>`
  },
})

export function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

md.use(anchor, {
  permalink: anchor.permalink.headerLink(),
  level: [1, 2, 3],
  slugify,
})

export function renderMarkdown(content: string, filePath?: string): string {
  const html = md.render(content)
  let processed = html

  if (filePath) {
    const dir = filePath.split('\\').slice(0, -1).join('\\')
    processed = processed.replace(
      /(<img[^>]+src=")(?!https?:\/\/)([^"]+)(")/g,
      (_, prefix, src: string, suffix) => {
        if (src.startsWith('/') || src.startsWith('data:') || src.startsWith('file:')) return _
        const fullPath = `${dir}\\${src.replace(/\//g, '\\')}`
        return `${prefix}${convertFileSrc(fullPath)}${suffix}`
      }
    )
  }

  return sanitizeHtml(processed)
}
