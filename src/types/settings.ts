export type ThemeMode = 'light' | 'dark' | 'system'
export type EditorMode = 'wysiwyg' | 'source'

export interface ReaderSettings {
  fontFamily: string
  fontSize: number
  lineHeight: number
  contentWidth: number | 'auto'
  themeColor: string
  editorMode: EditorMode
}
