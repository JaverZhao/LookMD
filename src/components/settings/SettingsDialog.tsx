import { useMemo, useState } from 'react'
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

const PRESET_COLORS = [
  { label: '默认蓝', value: '#3b82f6' },
  { label: '翡翠绿', value: '#10b981' },
  { label: '紫色', value: '#8b5cf6' },
  { label: '琥珀橙', value: '#f59e0b' },
  { label: '珊瑚红', value: '#ef4444' },
  { label: '青绿', value: '#14b8a6' },
]

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
  settings: ReaderSettings
  onUpdate: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void
  onReset: () => void
}

export function SettingsDialog({ open, onClose, settings, onUpdate, onReset }: SettingsDialogProps) {
  const [customHex, setCustomHex] = useState(settings.themeColor)

  const previewStyle = useMemo(
    () => ({
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}%`,
      lineHeight: `${settings.lineHeight}%`,
    }),
    [settings]
  )

  return (
    <Modal open={open} onClose={onClose} title="阅读与编辑设置">
      {/* Editor mode */}
      <div>
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          默认编辑模式
        </label>
        <div
          className="grid grid-cols-2 gap-1 p-1 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderColor: 'var(--color-border-primary)',
          }}
        >
          <button
            type="button"
            className="px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150"
            style={{
              color: settings.editorMode === 'wysiwyg' ? '#fff' : 'var(--color-text-secondary)',
              backgroundColor: settings.editorMode === 'wysiwyg' ? 'var(--color-accent)' : 'transparent',
            }}
            onClick={() => onUpdate('editorMode', 'wysiwyg')}
          >
            所见即所得
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-150"
            style={{
              color: settings.editorMode === 'source' ? '#fff' : 'var(--color-text-secondary)',
              backgroundColor: settings.editorMode === 'source' ? 'var(--color-accent)' : 'transparent',
            }}
            onClick={() => onUpdate('editorMode', 'source')}
          >
            Markdown 源码
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
          所见即所得模式会隐藏 Markdown 标记，保存时仍写入标准 Markdown 内容。
        </p>
      </div>

      {/* Theme color */}
      <div>
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          主题色
        </label>
        <div className="flex gap-2 mb-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.value}
              title={c.label}
              className="w-7 h-7 rounded-full cursor-pointer border-2 transition-transform duration-100"
              style={{
                backgroundColor: c.value,
                borderColor: settings.themeColor === c.value ? 'var(--color-text-primary)' : 'transparent',
                transform: settings.themeColor === c.value ? 'scale(1.15)' : 'scale(1)',
              }}
              onClick={() => { onUpdate('themeColor', c.value); setCustomHex(c.value) }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customHex}
            onChange={(e) => {
              setCustomHex(e.target.value)
              if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                onUpdate('themeColor', e.target.value)
              }
            }}
            onBlur={() => {
              if (!/^#[0-9a-fA-F]{6}$/.test(customHex)) {
                setCustomHex(settings.themeColor)
              }
            }}
            placeholder="#3b82f6"
            className="w-24 px-2 py-1.5 rounded-lg text-xs outline-none border"
            style={{
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-primary)',
              borderColor: 'var(--color-border-primary)',
            }}
          />
          <div
            className="w-7 h-7 rounded-full border"
            style={{ backgroundColor: settings.themeColor, borderColor: 'var(--color-border-primary)' }}
          />
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            输入十六进制色号
          </span>
        </div>
      </div>

      {/* Font family */}
      <div>
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          字体
        </label>
        {(() => {
          const isCustom = !COMMON_FONTS.some((f) => f.value === settings.fontFamily)
          return (
            <select
              value={isCustom ? '__custom__' : settings.fontFamily}
              onChange={(e) => {
                if (e.target.value !== '__custom__') onUpdate('fontFamily', e.target.value)
              }}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none border cursor-pointer"
              style={{
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border-primary)',
                fontFamily: settings.fontFamily,
              }}
            >
              {isCustom && <option value="__custom__">自定义字体</option>}
              {COMMON_FONTS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          )
        })()}
        <input
          type="text"
          value={settings.fontFamily}
          onChange={(e) => onUpdate('fontFamily', e.target.value)}
          placeholder="或输入自定义字体名称..."
          className="w-full px-3 py-2 rounded-xl text-sm outline-none border mt-2"
          style={{
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-bg-primary)',
            borderColor: 'var(--color-border-primary)',
            fontFamily: settings.fontFamily,
          }}
        />
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
          className="w-full accent-[var(--color-accent)]"
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
          className="w-full accent-[var(--color-accent)]"
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
            className="w-full mt-2 accent-[var(--color-accent)]"
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
