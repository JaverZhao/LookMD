export type MarkdownBlockRule =
  | { kind: 'heading'; prefix: string; level: 1 | 2 | 3 }
  | { kind: 'bulletList'; prefix: string }
  | { kind: 'orderedList'; prefix: string }
  | { kind: 'blockquote'; prefix: string }
  | { kind: 'codeBlock'; prefix: string }

const BLOCK_RULES: MarkdownBlockRule[] = [
  { kind: 'heading', prefix: '#', level: 1 },
  { kind: 'heading', prefix: '##', level: 2 },
  { kind: 'heading', prefix: '###', level: 3 },
  { kind: 'bulletList', prefix: '-' },
  { kind: 'bulletList', prefix: '*' },
  { kind: 'bulletList', prefix: '+' },
  { kind: 'orderedList', prefix: '1.' },
  { kind: 'blockquote', prefix: '>' },
  { kind: 'codeBlock', prefix: '```' },
]

export function findBlockInputRule(textBeforeCaret: string): MarkdownBlockRule | undefined {
  return BLOCK_RULES.find((rule) => rule.prefix === textBeforeCaret)
}

export interface MarkdownInlineRule {
  start: number
  content: string
  tagName: 'strong' | 'em' | 'del' | 'code' | 'a'
  href?: string
}

const INLINE_RULES: Array<{ pattern: RegExp; tagName: Exclude<MarkdownInlineRule['tagName'], 'a'> }> = [
  { pattern: /\*\*([^*\n]+)\*\*$/, tagName: 'strong' },
  { pattern: /~~([^~\n]+)~~$/, tagName: 'del' },
  { pattern: /`([^`\n]+)`$/, tagName: 'code' },
  { pattern: /\*([^*\n]+)\*$/, tagName: 'em' },
]

export function findInlineInputRule(textBeforeCaret: string): MarkdownInlineRule | undefined {
  const linkMatch = /\[([^\]\n]+)\]\(([^)\s]+)\)$/.exec(textBeforeCaret)
  if (linkMatch?.index !== undefined && !/^\s*(?:javascript|data|vbscript):/i.test(linkMatch[2])) {
    return {
      start: linkMatch.index,
      content: linkMatch[1],
      tagName: 'a',
      href: linkMatch[2],
    }
  }

  for (const rule of INLINE_RULES) {
    const match = rule.pattern.exec(textBeforeCaret)
    if (match?.index === undefined || !match[1].trim()) continue
    if (rule.tagName === 'em' && match.index > 0 && textBeforeCaret[match.index - 1] === '*') continue

    return {
      start: match.index,
      content: match[1],
      tagName: rule.tagName,
    }
  }

  return undefined
}
