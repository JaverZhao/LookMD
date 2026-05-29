export type ThemeMode = 'light' | 'dark' | 'system'

export interface ReaderSettings {
  fontFamily: string
  fontSize: number
  lineHeight: number
  contentWidth: number | 'auto'
  themeColor: string
}
