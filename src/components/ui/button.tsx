import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-sm text-sm font-bold tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-accent text-ink hover:bg-accent-hover',
        outline:
          'border border-accent bg-transparent text-accent hover:bg-accent hover:text-ink',
        secondary:
          'border border-line bg-surface text-content hover:border-accent hover:bg-coffee',
        ghost: 'text-content-muted hover:bg-surface hover:text-content',
        danger: 'bg-danger text-content hover:opacity-90',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-7',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-12 px-8',
        icon: 'h-10 w-10',
      },
      full: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: { variant: 'default', size: 'default', full: false },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, full, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, full }), className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
