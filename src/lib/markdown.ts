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

const editableMd: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
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

/**
 * markdown-it percent-encodes non-ASCII image URLs. Decode a local path before
 * passing it to Tauri so `convertFileSrc` encodes the real filename exactly once.
 */
function decodeLocalImagePath(src: string): string {
  try {
    return decodeURIComponent(src)
  } catch {
    // Keep malformed escape sequences untouched so rendering does not fail.
    return src
  }
}

function resolveLocalImagePath(src: string, filePath: string): string | null {
  if (/^(?:https?:\/\/|data:|file:|asset:)/i.test(src)) return null
  if (src.startsWith('/')) return null

  const decoded = decodeLocalImagePath(src).replace(/\//g, '\\')
  if (/^[A-Za-z]:\\/.test(decoded) || decoded.startsWith('\\\\')) return decoded
  if (decoded.startsWith('\\')) return null

  const dir = filePath.split('\\').slice(0, -1).join('\\')
  return `${dir}\\${decoded}`
}

export function renderMarkdown(content: string, filePath?: string): string {
  const html = md.render(content)
  let processed = html

  if (filePath) {
    processed = processed.replace(
      /(<img[^>]+src=")([^"]+)(")/g,
      (_, prefix, src: string, suffix) => {
        const fullPath = resolveLocalImagePath(src, filePath)
        if (!fullPath) return _
        return `${prefix}${convertFileSrc(fullPath)}${suffix}`
      }
    )
  }

  return sanitizeHtml(processed)
}

export function renderEditableMarkdown(content: string, filePath?: string): string {
  let html = editableMd.render(content)

  if (filePath) {
    html = html.replace(
      /(<img[^>]+src=")([^"]+)(")/g,
      (match: string, prefix: string, src: string, suffix: string) => {
        const fullPath = resolveLocalImagePath(src, filePath)
        if (!fullPath) return match
        return `${prefix}${convertFileSrc(fullPath)}${suffix} data-md-src="${src}"`
      }
    )
  }

  return sanitizeHtml(html)
}
