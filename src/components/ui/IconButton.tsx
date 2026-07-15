import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  tooltip?: string
}

export function IconButton({ children, className, tooltip, title, 'aria-label': ariaLabel, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      title={tooltip ?? title}
      aria-label={ariaLabel ?? tooltip}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-lg',
        'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
        'hover:bg-[var(--color-bg-tertiary)]',
        'transition-colors duration-150',
        'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
