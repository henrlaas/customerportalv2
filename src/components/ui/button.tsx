
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "outline" | "link" | "ghost" | "destructive" | "default";
  size?: "sm" | "md" | "lg" | "icon";
  icon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "primary", size = "md", icon, isLoading, fullWidth, asChild, ...props }, ref) => {
    const getVariantClass = () => {
      switch (variant) {
        case "primary":
          return "btn-primary";
        case "secondary":
          return "btn-secondary";
        case "success":
          return "btn-success";
        case "danger":
          return "btn-danger";
        case "warning":
          return "btn-warning";
        case "info":
          return "btn-info";
        case "outline":
          return "btn-outline";
        case "link":
          return "btn-link";
        case "ghost":
          return "btn-ghost";
        case "destructive":
          return "btn-destructive";
        case "default":
          return "btn-default";
        default:
          return "btn-primary";
      }
    };

    const getSizeClass = () => {
      switch (size) {
        case "sm":
          return "btn-sm";
        case "lg":
          return "btn-lg";
        case "icon":
          return "btn-icon";
        default:
          return "";
      }
    };

    // If asChild is true, we need to clone the child element with the proper props
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: `btn ${getVariantClass()} ${getSizeClass()} ${fullWidth ? "w-100" : ""} ${className || ""}`,
        ref,
        ...props
      });
    }

    return (
      <button
        className={`btn ${getVariantClass()} ${getSizeClass()} ${fullWidth ? "w-100" : ""} ${className || ""}`}
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
