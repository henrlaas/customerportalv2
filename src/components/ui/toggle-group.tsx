
"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { buttonVariants } from "./button";

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-1 rounded-md bg-muted p-1",
      className
    )}
    {...props}
  />
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

// Define custom toggle item variants including "tab"
const toggleItemVariants = cva("", {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      ghost: "hover:bg-muted hover:text-foreground", 
      tab: "data-[state=on]:border-b-2 data-[state=on]:border-[#004743] data-[state=on]:text-[#004743] data-[state=on]:font-semibold"
    },
    size: {
      default: "h-9 px-3",
      sm: "h-8 px-2 text-xs",
      lg: "h-10 px-4"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleItemVariants>
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  if (variant === "tab") {
    return (
      <ToggleGroupPrimitive.Item
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium ring-offset-background transition-all",
          toggleItemVariants({ variant, size }),
          className
        )}
        {...props}
      />
    );
  }

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        buttonVariants({
          variant: props["data-state"] === "on" ? "default" : "ghost",
          size,
        }),
        className
      )}
      {...props}
    />
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
