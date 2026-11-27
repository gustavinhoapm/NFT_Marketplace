import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-11 w-full rounded-sm border border-line bg-ink px-4 text-sm text-content placeholder:text-tan transition-colors hover:border-accent-muted focus:border-accent focus:outline-none',
        invalid && 'border-danger focus:border-danger',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
