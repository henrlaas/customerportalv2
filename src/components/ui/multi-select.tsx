
import * as React from "react"
import { X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

export interface MultiSelectProps {
  placeholder?: string;
  value?: string[];
  onValueChange?: (value: string[]) => void;
  children?: React.ReactNode;
  className?: string;
}

export const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  ({ placeholder, value = [], onValueChange, className, children }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [open, setOpen] = React.useState(false)
    const [selected, setSelected] = React.useState<string[]>(value)
    const [inputValue, setInputValue] = React.useState("")

    // Sync internal state with external value
    React.useEffect(() => {
      setSelected(value)
    }, [value])

    // Sync external value with internal state
    const handleValueChange = React.useCallback(
      (newValue: string[]) => {
        setSelected(newValue)
        onValueChange?.(newValue)
      },
      [onValueChange]
    )

    // Handle item selection
    const handleSelect = React.useCallback(
      (itemValue: string) => {
        setInputValue("")

        if (selected.includes(itemValue)) {
          // If already selected, remove it
          handleValueChange(selected.filter((item) => item !== itemValue))
        } else {
          // Otherwise, add it
          handleValueChange([...selected, itemValue])
        }
      },
      [selected, handleValueChange]
    )

    // Remove item when badge X is clicked
    const handleRemove = React.useCallback(
      (itemValue: string) => {
        handleValueChange(selected.filter((item) => item !== itemValue))
      },
      [selected, handleValueChange]
    )

    // Handle keyboard navigation
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current
        if (e.key === "Backspace" && input && inputValue === "" && selected.length > 0) {
          // Remove the last item on backspace when input is empty
          handleValueChange(selected.slice(0, -1))
        }
      },
      [inputValue, selected, handleValueChange]
    )

    // Helper function to find the child component with matching value
    const findChildByValue = (value: string) => {
      return React.Children.toArray(children).find(
        (child) => 
          React.isValidElement(child) && 
          'value' in child.props && 
          child.props.value === value
      )
    }

    // Helper function to get the display text for a value
    const getDisplayText = (value: string) => {
      const child = findChildByValue(value)
      if (React.isValidElement(child)) {
        return child.props.children;
      }
      return value;
    }

    return (
      <Command
        ref={ref}
        onKeyDown={handleKeyDown}
        className={cn("overflow-visible bg-transparent", className)}
      >
        <div
          className="group border border-input px-3 py-2 text-sm rounded-md focus-within:ring-1 focus-within:ring-ring flex flex-wrap gap-1"
          onClick={() => {
            setOpen(true)
            inputRef.current?.focus()
          }}
        >
          {selected.length > 0 && (
            <>
              {selected.map((item) => (
                <Badge key={item} variant="secondary" className="rounded-sm px-1 font-normal">
                  {getDisplayText(item)}
                  <button
                    type="button"
                    className="ml-1 rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(item);
                    }}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </button>
                </Badge>
              ))}
            </>
          )}
          <CommandInput
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? placeholder : undefined}
            className="flex-1 outline-none placeholder:text-muted-foreground min-w-[120px] bg-transparent"
          />
        </div>
        <div className="relative">
          {open && (
            <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {React.Children.map(children, (child) => {
                    if (React.isValidElement<MultiSelectItemProps>(child) && child.type === MultiSelectItem) {
                      // Only pass the handleSelect function to MultiSelectItem components
                      return React.cloneElement(child, {
                        onSelect: handleSelect,
                      });
                    }
                    return child;
                  })}
                </CommandGroup>
              </CommandList>
            </div>
          )}
        </div>
      </Command>
    )
  }
)
MultiSelect.displayName = "MultiSelect"

export interface MultiSelectItemProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}

export const MultiSelectItem = React.forwardRef<HTMLDivElement, MultiSelectItemProps>(
  ({ value, children, className, disabled, onSelect, ...props }, ref) => {
    const handleClick = () => {
      if (onSelect) {
        onSelect(value);
      }
    }

    return (
      <CommandItem
        ref={ref}
        value={value}
        onSelect={handleClick}
        {...props}
        className={cn(
          "cursor-pointer",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        disabled={disabled}
      >
        {children}
      </CommandItem>
    )
  }
)
MultiSelectItem.displayName = "MultiSelectItem"

export const MultiSelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
))
MultiSelectTrigger.displayName = "MultiSelectTrigger"

export const MultiSelectValue = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm", className)} {...props}>
    {placeholder}
  </div>
))
MultiSelectValue.displayName = "MultiSelectValue"

export const MultiSelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      className
    )}
    {...props}
  />
))
MultiSelectContent.displayName = "MultiSelectContent"
