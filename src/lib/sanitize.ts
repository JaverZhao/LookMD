import DOMPurify from 'dompurify'

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'blockquote',
      'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'a', 'img',
      'strong', 'em', 'del', 'ins', 'sub', 'sup',
      'input',
    ],
    ALLOWED_ATTR: [
      'id', 'class', 'href', 'src', 'alt', 'title',
      'target', 'rel', 'type', 'checked',
      'width', 'height', 'align',
    ],
  })
}
