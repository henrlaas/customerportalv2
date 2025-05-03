
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] hover:-translate-y-0.5 active:translate-y-0",
  {
    variants: {
      variant: {
        default: "bg-teal text-primary-foreground hover:bg-teal-800 hover:shadow-playful",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-playful",
        outline:
          "border-2 border-input bg-background hover:bg-accent/10 hover:border-accent hover:shadow-soft",
        secondary:
          "bg-coral text-white hover:bg-coral/90 hover:shadow-playful",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        sunshine: "bg-sunshine text-black hover:bg-sunshine/90 hover:shadow-playful",
        mint: "bg-mint text-teal hover:bg-mint/90 hover:shadow-playful",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-pill px-4 py-2",
        lg: "h-12 rounded-pill px-8 py-3 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
