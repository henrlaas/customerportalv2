
import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "bordered" | "shadow" | "flat";
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const getVariantClass = () => {
      switch (variant) {
        case "bordered":
          return "card-bordered";
        case "shadow":
          return "card-shadow";
        case "flat":
          return "card-flat";
        default:
          return "";
      }
    };

    return (
      <div
        ref={ref}
        className={`card ${getVariantClass()} ${className || ""}`}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`card-header ${className || ""}`}
        {...props}
      />
    );
  }
);

CardHeader.displayName = "CardHeader";

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={`card-title ${className || ""}`}
        {...props}
      />
    );
  }
);

CardTitle.displayName = "CardTitle";

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`card-description ${className || ""}`}
        {...props}
      />
    );
  }
);

CardDescription.displayName = "CardDescription";

type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`card-content ${className || ""}`}
        {...props}
      />
    );
  }
);

CardContent.displayName = "CardContent";

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`card-footer ${className || ""}`}
        {...props}
      />
    );
  }
);

CardFooter.displayName = "CardFooter";

// Remove the duplicate export line at the bottom
