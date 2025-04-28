
"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { COUNTRIES, Country, DEFAULT_COUNTRY_NAME, getNorwayCountry } from "@/constants/countries";

export interface CountrySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  /** Pass true to display a read-only version with no dropdown */
  readOnly?: boolean;
  /** Error message to show */
  error?: string;
}

export function CountrySelector({
  value,
  onValueChange,
  disabled = false,
  className,
  placeholder = "Select country",
  readOnly = false,
  error
}: CountrySelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(null);
  
  // Ensure countries is always a valid array
  const countries = React.useMemo(() => {
    return Array.isArray(COUNTRIES) ? COUNTRIES : [];
  }, []);

  // Find the selected country or default to Norway
  React.useEffect(() => {
    if (value) {
      const country = countries.find((c) => c.name === value);
      setSelectedCountry(country || null);
    } else {
      // Set default to Norway
      const norway = getNorwayCountry();
      if (norway) {
        setSelectedCountry(norway);
        onValueChange(norway.name);
      }
    }
  }, [value, onValueChange, countries]);

  const renderCountryDisplay = () => {
    if (!selectedCountry) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">{selectedCountry.flag}</span>
        <span className="flex-1 truncate">{selectedCountry.name}</span>
      </div>
    );
  };

  // If readOnly, just return a simple display
  if (readOnly) {
    return (
      <div className={cn(
        "flex items-center gap-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        disabled && "opacity-50 cursor-not-allowed",
        error && "border-destructive",
        className
      )}>
        {renderCountryDisplay()}
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between",
              error && "border-destructive",
            )}
          >
            {renderCountryDisplay()}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.length > 0 && countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    onValueChange(country.name);
                    setSelectedCountry(country);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">
                      {country.flag}
                    </span>
                    <span>{country.name}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedCountry?.name === country.name
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
