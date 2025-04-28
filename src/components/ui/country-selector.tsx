
"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(null);
  
  // Create a safe copy of the countries array with null safety
  const countries = React.useMemo(() => {
    return Array.isArray(COUNTRIES) ? [...COUNTRIES] : [];
  }, []);

  // Filter countries based on search value
  const filteredCountries = React.useMemo(() => {
    if (!searchValue) return countries;
    
    return countries.filter(country => 
      country.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [countries, searchValue]);

  // Set default country on mount or when value changes
  React.useEffect(() => {
    try {
      // If value is provided and countries is valid, try to find the matching country
      if (value && Array.isArray(countries) && countries.length > 0) {
        const country = countries.find((c) => c.name === value);
        if (country) {
          setSelectedCountry(country);
          return;
        }
      }
      
      // Default to Norway if no value or value not found
      const norway = getNorwayCountry();
      if (norway) {
        setSelectedCountry(norway);
        // Only update the value if it's different to avoid loops
        if (value !== norway.name) {
          onValueChange(norway.name);
        }
      }
    } catch (error) {
      console.error("Error setting default country:", error);
    }
  }, [value, countries, onValueChange]);

  // Render the country display (with null safety)
  const renderCountryDisplay = () => {
    if (!selectedCountry) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{selectedCountry.flag}</span>
        <span className="flex-1 truncate">{selectedCountry.name}</span>
      </div>
    );
  };

  // For readonly display, just show a simple view without flag
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

  // Handle country selection with explicit event handling
  const handleCountrySelect = (country: Country, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onValueChange(country.name);
    setSelectedCountry(country);
    setOpen(false);
    setSearchValue("");
    console.log("Country selected:", country.name);
  };

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
        <PopoverContent 
          className="w-full p-0 z-[100]" 
          align="start"
          sideOffset={4}
        >
          <div className="flex flex-col">
            {/* Search input */}
            <div className="flex items-center border-b px-3">
              <input
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search country..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            
            {/* Country list with improved ScrollArea */}
            <div className="relative">
              <ScrollArea className="h-[250px]">
                {filteredCountries.length === 0 ? (
                  <div className="py-6 text-center text-sm">No country found.</div>
                ) : (
                  <div className="p-1">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        className={cn(
                          "relative flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                          "hover:bg-accent hover:text-accent-foreground",
                          "cursor-pointer select-none focus:bg-accent focus:text-accent-foreground",
                          "focus-visible:outline focus-visible:outline-offset-2",
                          selectedCountry?.name === country.name && "bg-accent text-accent-foreground"
                        )}
                        onClick={(e) => handleCountrySelect(country, e)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleCountrySelect(country, e as unknown as React.MouseEvent);
                          }
                        }}
                      >
                        <div className="flex w-full items-center gap-2 pointer-events-none">
                          <span className="text-lg">{country.flag}</span>
                          <span className="flex-1">{country.name}</span>
                          {selectedCountry?.name === country.name && (
                            <Check className="h-4 w-4 ml-auto" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
