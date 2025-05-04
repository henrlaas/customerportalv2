
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Define the button variants using class-variance-authority
export const buttonVariants = cva("btn", {
  variants: {
    variant: {
      primary: "btn-primary",
      secondary: "btn-secondary",
      success: "btn-success",
      danger: "btn-danger",
      warning: "btn-warning",
      info: "btn-info",
      outline: "btn-outline",
      link: "btn-link",
      ghost: "btn-ghost",
      destructive: "btn-destructive",
      default: "btn-default",
    },
    size: {
      sm: "btn-sm",
      md: "",
      lg: "btn-lg",
      icon: "btn-icon",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", size = "md", icon, isLoading, fullWidth, asChild, ...props }, ref) => {
    // If asChild is true, we need to clone the child element with the proper props
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: cn(
          buttonVariants({ variant, size }),
          fullWidth ? "w-100" : "",
          className
        ),
        ref,
        ...props
      });
    }

    return (
      <button
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth ? "w-100" : "",
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <div className="spinner btn-spinner"></div>
        )}
        {icon && !isLoading && (
          <span className="btn-icon">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
