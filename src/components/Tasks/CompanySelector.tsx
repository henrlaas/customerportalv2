
import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Company } from '@/types/company';
import { Checkbox } from '@/components/ui/checkbox';

interface CompanySelectorProps {
  companies: Company[];
  selectedCompanyId: string | null;
  onSelect: (companyId: string | null) => void;
  showSubsidiaries: boolean;
  onToggleSubsidiaries: (show: boolean) => void;
  isLoading?: boolean;
  className?: string;
}

export function CompanySelector({
  companies,
  selectedCompanyId,
  onSelect,
  showSubsidiaries,
  onToggleSubsidiaries,
  isLoading = false,
  className,
}: CompanySelectorProps) {
  const [open, setOpen] = useState(false);
  
  const selectedCompany = companies.find(company => company.id === selectedCompanyId);
  
  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCompany ? selectedCompany.name : "Select company..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search company..." />
            <div className="p-2 flex items-center border-b border-border">
              <Checkbox 
                id="show-subsidiaries"
                checked={showSubsidiaries}
                onCheckedChange={(checked) => onToggleSubsidiaries(!!checked)}
              />
              <label 
                htmlFor="show-subsidiaries" 
                className="ml-2 text-sm cursor-pointer"
              >
                Show subsidiaries
              </label>
            </div>
            <CommandEmpty>No companies found.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-2 text-center text-sm text-muted-foreground">Loading...</div>
              ) : companies.map(company => (
                <CommandItem
                  key={company.id}
                  value={company.id}
                  onSelect={() => {
                    onSelect(company.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer",
                    company.parent_id ? "pl-6" : ""
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCompanyId === company.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {company.name}
                  {company.parent_id && (
                    <span className="ml-2 text-xs text-muted-foreground">(subsidiary)</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
