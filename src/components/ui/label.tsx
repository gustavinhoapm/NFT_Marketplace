import type { LabelHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export function Label({
  className,
  required,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label
      className={cn(
        'mb-2 block text-xs font-bold tracking-wide text-content-muted uppercase',
        className,
      )}
      {...props}
    >
      {props.children}
      {required && (
        <span aria-hidden="true" className="ml-1 text-danger">
          *
        </span>
      )}
    </label>
  )
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null
  return (
    <p role="alert" className="mt-1.5 text-xs text-danger">
      {children}
    </p>
  )
}
