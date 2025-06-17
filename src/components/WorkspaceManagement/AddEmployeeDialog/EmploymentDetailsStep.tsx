
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CountrySelector from '@/components/ui/CountrySelector/selector';
import { COUNTRIES } from '@/components/ui/CountrySelector/countries';
import { SelectMenuOption } from '@/components/ui/CountrySelector/types';

interface EmploymentDetailsStepProps {
  formData: {
    address: string;
    zipcode: string;
    country: string;
    city: string;
    employee_type: 'Employee' | 'Freelancer';
    hourly_salary: number;
    employed_percentage: number;
    paycheck_solution?: string;
  };
  onUpdate: (data: Partial<EmploymentDetailsStepProps['formData']>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EmploymentDetailsStep({ 
  formData, 
  onUpdate, 
  onNext, 
  onBack 
}: EmploymentDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);

  // Find the selected country option or default to Norway
  const selectedCountry = COUNTRIES.find(country => country.title === formData.country) || 
                         COUNTRIES.find(country => country.title === 'Norge') || 
                         COUNTRIES[0];

  // Set default country to Norway if not already set
  if (!formData.country) {
    const norwayOption = COUNTRIES.find(country => country.title === 'Norge');
    if (norwayOption) {
      onUpdate({ country: norwayOption.title });
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.zipcode) newErrors.zipcode = 'Zip code is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.employee_type) newErrors.employee_type = 'Employee type is required';
    if (!formData.hourly_salary) newErrors.hourly_salary = 'Hourly salary is required';
    if (!formData.employed_percentage) newErrors.employed_percentage = 'Employment percentage is required';
    else if (formData.employed_percentage <= 0 || formData.employed_percentage > 100) {
      newErrors.employed_percentage = 'Employment percentage must be between 1 and 100';
    }
    
    if (formData.employee_type === 'Freelancer' && !formData.paycheck_solution) {
      newErrors.paycheck_solution = 'Paycheck solution is required for Freelancers';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  const handleCountryChange = (countryCode: string) => {
    const selectedCountryOption = COUNTRIES.find(country => country.value === countryCode);
    if (selectedCountryOption) {
      onUpdate({ country: selectedCountryOption.title });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Employment Details</h2>
        
        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input 
            id="address"
            value={formData.address}
            onChange={(e) => onUpdate({ address: e.target.value })}
            className={errors.address ? 'border-red-500' : ''}
          />
          {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input 
              id="city"
              value={formData.city}
              onChange={(e) => onUpdate({ city: e.target.value })}
              className={errors.city ? 'border-red-500' : ''}
            />
            {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipcode">Zip Code *</Label>
            <Input 
              id="zipcode"
              value={formData.zipcode}
              onChange={(e) => onUpdate({ zipcode: e.target.value })}
              className={errors.zipcode ? 'border-red-500' : ''}
            />
            {errors.zipcode && <p className="text-sm text-red-500">{errors.zipcode}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <div className={errors.country ? 'border border-red-500 rounded-md' : ''}>
            <CountrySelector
              id="country"
              open={isCountrySelectorOpen}
              onToggle={() => setIsCountrySelectorOpen(!isCountrySelectorOpen)}
              onChange={handleCountryChange}
              selectedValue={selectedCountry}
            />
          </div>
          {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee_type">Employee Type *</Label>
          <Select
            value={formData.employee_type}
            onValueChange={(value: 'Employee' | 'Freelancer') => onUpdate({ 
              employee_type: value,
              paycheck_solution: value === 'Employee' ? undefined : formData.paycheck_solution 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select employee type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Employee">Employee</SelectItem>
              <SelectItem value="Freelancer">Freelancer</SelectItem>
            </SelectContent>
          </Select>
          {errors.employee_type && <p className="text-sm text-red-500">{errors.employee_type}</p>}
        </div>

        {formData.employee_type === 'Freelancer' && (
          <div className="space-y-2">
            <Label htmlFor="paycheck_solution">Paycheck Solution *</Label>
            <Input 
              id="paycheck_solution"
              value={formData.paycheck_solution || ''}
              onChange={(e) => onUpdate({ paycheck_solution: e.target.value })}
              placeholder="Enter paycheck solution details"
              className={errors.paycheck_solution ? 'border-red-500' : ''}
            />
            {errors.paycheck_solution && <p className="text-sm text-red-500">{errors.paycheck_solution}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hourly_salary">Hourly Rate (NOK) *</Label>
            <Input 
              id="hourly_salary"
              type="number"
              min="0"
              value={formData.hourly_salary || ''}
              onChange={(e) => onUpdate({ hourly_salary: parseFloat(e.target.value) || 0 })}
              className={errors.hourly_salary ? 'border-red-500' : ''}
            />
            {errors.hourly_salary && <p className="text-sm text-red-500">{errors.hourly_salary}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employed_percentage">Employment Percentage (%) *</Label>
            <Input 
              id="employed_percentage"
              type="number"
              min="1"
              max="100"
              value={formData.employed_percentage || ''}
              onChange={(e) => onUpdate({ employed_percentage: parseInt(e.target.value) || 0 })}
              className={errors.employed_percentage ? 'border-red-500' : ''}
            />
            {errors.employed_percentage && <p className="text-sm text-red-500">{errors.employed_percentage}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">
          Next Step
        </Button>
      </div>
    </form>
  );
}
