import { forwardRef, type SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(({ className, invalid, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-10 w-full appearance-none rounded-sm border border-line bg-ink px-3 pr-9 text-sm text-content focus:border-accent focus:outline-none',
        invalid && 'border-danger focus:border-danger',
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-accent"
    >
      ▾
    </span>
  </div>
))
Select.displayName = 'Select'
