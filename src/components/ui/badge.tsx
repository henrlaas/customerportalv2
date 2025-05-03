
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 hover:animate-pulse-soft",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-teal text-white hover:bg-teal-800",
        secondary:
          "border-transparent bg-coral text-white hover:bg-coral/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        marketing:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
        web:
          "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200",
        partner:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        mint:
          "border-transparent bg-mint text-teal hover:bg-mint/80",
        sunshine:
          "border-transparent bg-sunshine text-black hover:bg-sunshine/80",
        coral:
          "border-transparent bg-coral text-white hover:bg-coral/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
