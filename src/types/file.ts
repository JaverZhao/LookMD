export interface MarkdownFile {
  path: string;
  name: string;
  content: string;
  size?: number;
  lastOpenedAt: number;
}

export interface RecentFileItem {
  path: string;
  name: string;
  lastOpenedAt: number;
}
