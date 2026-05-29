import { createHighlighter, type Highlighter } from 'shiki'

let highlighterPromise: Promise<Highlighter> | null = null
let highlighterInstance: Highlighter | null = null

const LIGHT_THEME = 'github-light'
const DARK_THEME = 'github-dark'

const LANGUAGES = [
  'ts', 'tsx', 'js', 'jsx', 'json', 'bash', 'sh',
  'css', 'html', 'md', 'markdown', 'python', 'rust',
  'sql', 'yaml', 'toml', 'xml', 'diff',
]

async function getHighlighter(): Promise<Highlighter> {
  if (highlighterInstance) return highlighterInstance

  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [LIGHT_THEME, DARK_THEME],
      langs: LANGUAGES,
    }).then((hl) => {
      highlighterInstance = hl
      return hl
    })
  }

  return highlighterPromise
}

export async function highlightCode(
  code: string,
  lang: string,
  isDark: boolean
): Promise<string> {
  const highlighter = await getHighlighter()
  const theme = isDark ? DARK_THEME : LIGHT_THEME

  try {
    const html = highlighter.codeToHtml(code, {
      lang: lang || 'text',
      theme,
    })
    return html
  } catch {
    return highlighter.codeToHtml(code, {
      lang: 'text',
      theme,
    })
  }
}

export { getHighlighter }
