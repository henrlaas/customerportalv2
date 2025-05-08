
"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
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

// Update the variant definition to include "tab" as a valid variant
const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof buttonVariants> & {
      size?: "sm" | "default" | "lg";
      variant?: "default" | "ghost" | "tab"; // Added "tab" as a valid option
    }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  // If variant is 'tab', use tab-specific styling
  if (variant === "tab") {
    return (
      <ToggleGroupPrimitive.Item
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap px-4 py-2 text-sm font-medium ring-offset-background transition-all data-[state=on]:border-b-2 data-[state=on]:border-[#004743] data-[state=on]:text-[#004743] data-[state=on]:font-semibold",
          className
        )}
        {...props}
      />
    );
  }

  // Default toggle styling
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
