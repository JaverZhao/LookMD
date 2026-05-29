export type ThemeMode = 'light' | 'dark' | 'system'

export interface ReaderSettings {
  fontFamily: string
  fontSize: number  // 50–200, represents percentage
  lineHeight: number  // percentage, default 170
  contentWidth: number | 'auto'  // px or 'auto', default 900
}
