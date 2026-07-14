import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined',
})

turndown.use(gfm)

turndown.addRule('lookmdRelativeImage', {
  filter: (node) => node.nodeName === 'IMG' && node.hasAttribute('data-md-src'),
  replacement: (_content, node) => {
    const src = node.getAttribute('data-md-src') ?? ''
    const alt = (node.getAttribute('alt') ?? '').replaceAll('[', '\\[').replaceAll(']', '\\]')
    const title = node.getAttribute('title')
    return src ? `![${alt}](${src}${title ? ` "${title.replace(/"/g, '\\"')}"` : ''})` : ''
  },
})

turndown.addRule('lookmdFencedCodeBlock', {
  filter: (node) => node.nodeName === 'PRE',
  replacement: (_content, node) => {
    const language = node.dataset.lang ?? node.querySelector('code')?.className.match(/language-([^\s]+)/)?.[1] ?? ''
    const code = (node.textContent ?? '').replace(/\n$/, '')
    const longestFence = Math.max(3, ...Array.from(code.matchAll(/`+/g), (match) => match[0].length + 1))
    const fence = '`'.repeat(longestFence)
    return `\n\n${fence}${language}\n${code}\n${fence}\n\n`
  },
})

export function editableHtmlToMarkdown(html: string): string {
  const markdown = turndown.turndown(html)
  return markdown.replace(/\u00a0/g, ' ').replace(/\n{3,}/g, '\n\n').trimEnd()
}
