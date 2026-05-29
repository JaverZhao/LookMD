import { useMemo } from 'react'
import type { ReaderSettings } from '../../types/settings'
import { Modal } from '../ui/Modal'

const COMMON_FONTS = [
  { label: '系统默认', value: 'Inter, "Microsoft YaHei", "PingFang SC", system-ui, sans-serif' },
  { label: 'Microsoft YaHei', value: '"Microsoft YaHei", sans-serif' },
  { label: 'PingFang SC', value: '"PingFang SC", sans-serif' },
  { label: 'SimSun (宋体)', value: '"SimSun", serif' },
  { label: 'SimHei (黑体)', value: '"SimHei", sans-serif' },
  { label: 'KaiTi (楷体)', value: '"KaiTi", serif' },
  { label: 'Segoe UI', value: '"Segoe UI", sans-serif' },
  { label: 'Consolas', value: '"Consolas", monospace' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", "Consolas", monospace' },
  { label: 'Noto Sans SC', value: '"Noto Sans SC", sans-serif' },
  { label: 'Source Han Serif SC', value: '"Source Han Serif SC", serif' },
]

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
  settings: ReaderSettings
  onUpdate: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void
  onReset: () => void
}

export function SettingsDialog({ open, onClose, settings, onUpdate, onReset }: SettingsDialogProps) {
  const previewStyle = useMemo(
    () => ({
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}%`,
      lineHeight: `${settings.lineHeight}%`,
    }),
    [settings]
  )

  return (
    <Modal open={open} onClose={onClose} title="阅读设置">
      {/* Font family */}
      <div>
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          字体
        </label>
        <select
          value={settings.fontFamily}
          onChange={(e) => onUpdate('fontFamily', e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none border cursor-pointer"
          style={{
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-bg-primary)',
            borderColor: 'var(--color-border-primary)',
            fontFamily: settings.fontFamily,
          }}
        >
          {COMMON_FONTS.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font size */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            字号
          </label>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {settings.fontSize}%
          </span>
        </div>
        <input
          type="range"
          min={50}
          max={200}
          step={5}
          value={settings.fontSize}
          onChange={(e) => onUpdate('fontSize', Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
          <span>50%</span>
          <span>100%</span>
          <span>200%</span>
        </div>
      </div>

      {/* Line height */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            行距
          </label>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {settings.lineHeight}%
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={250}
          step={5}
          value={settings.lineHeight}
          onChange={(e) => onUpdate('lineHeight', Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
          <span>100%</span>
          <span>170%</span>
          <span>250%</span>
        </div>
      </div>

      {/* Content width */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            内容宽度
          </label>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            {settings.contentWidth === 'auto' ? '自适应' : `${settings.contentWidth}px`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer" style={{ color: 'var(--color-text-secondary)' }}>
            <input
              type="checkbox"
              checked={settings.contentWidth === 'auto'}
              onChange={(e) => onUpdate('contentWidth', e.target.checked ? 'auto' : 900)}
            />
            自适应窗口宽度
          </label>
        </div>
        {settings.contentWidth !== 'auto' && (
          <input
            type="range"
            min={480}
            max={1400}
            step={20}
            value={settings.contentWidth}
            onChange={(e) => onUpdate('contentWidth', Number(e.target.value))}
            className="w-full mt-2"
          />
        )}
      </div>

      {/* Preview */}
      <div
        className="rounded-xl p-4 text-sm border"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderColor: 'var(--color-border-primary)',
          ...previewStyle,
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>预览</p>
        <p>
          这是阅读设置的实时预览效果。调整左侧选项可立即看到变化。
        </p>
      </div>

      {/* Reset */}
      <div className="flex justify-end pt-1">
        <button
          className="px-4 py-1.5 rounded-xl text-xs font-medium cursor-pointer"
          style={{
            color: 'var(--color-text-tertiary)',
            border: '1px solid var(--color-border-primary)',
          }}
          onClick={onReset}
        >
          恢复默认
        </button>
      </div>
    </Modal>
  )
}
