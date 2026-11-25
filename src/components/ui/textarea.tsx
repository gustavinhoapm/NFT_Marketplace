import { forwardRef, type TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      'min-h-24 w-full rounded-sm border border-line bg-ink px-4 py-3 text-sm placeholder:text-content-subtle focus:border-accent focus:outline-none',
      invalid && 'border-danger',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
