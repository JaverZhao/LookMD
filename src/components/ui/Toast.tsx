import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ToastProps {
  message: string | null
  type?: 'error' | 'info'
  onDismiss: () => void
}

export function Toast({ message, type = 'error', onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  if (!message) return null

  const bgColor = type === 'error' ? '#fef2f2' : '#f0f9ff'
  const textColor = type === 'error' ? '#dc2626' : '#0369a1'
  const borderColor = type === 'error' ? '#fecaca' : '#bae6fd'

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-md animate-in slide-in-from-top-2"
      style={{
        backgroundColor: bgColor,
        borderColor,
        color: textColor,
      }}
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        title="关闭提示"
        aria-label="关闭提示"
        className="flex items-center justify-center w-5 h-5 rounded cursor-pointer opacity-60 hover:opacity-100"
        onClick={onDismiss}
      >
        <X size={14} />
      </button>
    </div>
  )
}
