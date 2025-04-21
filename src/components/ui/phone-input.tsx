
import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  className?: string
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    // Remove +47 from the value for display
    const displayValue = value?.startsWith('+47') ? value.slice(3) : value

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      // Ensure only numbers are entered
      if (newValue && !/^\d*$/.test(newValue)) return
      
      // Add +47 prefix when sending value back
      onChange?.(`+47${newValue}`)
    }

    return (
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
          🇳🇴 +47
        </div>
        <Input
          {...props}
          ref={ref}
          value={displayValue || ''}
          onChange={handleChange}
          className={cn("pl-16", className)}
          type="tel"
        />
      </div>
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput }
