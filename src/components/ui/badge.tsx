import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2 py-1 text-[10px] font-bold tracking-wider uppercase',
  {
    variants: {
      variant: {
        default: 'bg-accent text-ink',
        outline: 'border border-accent-muted text-accent',
        muted: 'bg-coffee text-content-muted',
        success: 'bg-success/20 text-success',
        danger: 'bg-danger/20 text-danger',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
