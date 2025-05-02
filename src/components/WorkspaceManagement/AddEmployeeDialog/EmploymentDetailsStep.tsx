
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface EmploymentDetailsStepProps {
  formData: {
    employee_type: 'Employee' | 'Freelancer';
    hourly_salary: number;
    employed_percentage: number;
    address: string;
    zipcode: string;
    country: string;
    city: string;
  };
  onUpdate: (data: Partial<EmploymentDetailsStepProps['formData']>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EmploymentDetailsStep({ formData, onUpdate, onNext, onBack }: EmploymentDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.address) 
      newErrors.address = 'Address is required';
    
    if (!formData.zipcode) 
      newErrors.zipcode = 'ZIP code is required';
    
    if (!formData.country) 
      newErrors.country = 'Country is required';
    
    if (!formData.city) 
      newErrors.city = 'City is required';
    
    if (formData.hourly_salary <= 0)
      newErrors.hourly_salary = 'Hourly salary must be greater than 0';
    
    if (formData.employed_percentage <= 0 || formData.employed_percentage > 100)
      newErrors.employed_percentage = 'Employed percentage must be between 1 and 100';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Employment Details</h2>
        
        <div className="space-y-2">
          <Label>Employee Type *</Label>
          <RadioGroup 
            value={formData.employee_type}
            onValueChange={(value) => onUpdate({ employee_type: value as 'Employee' | 'Freelancer' })}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Employee" id="employee" />
              <Label htmlFor="employee">Employee</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Freelancer" id="freelancer" />
              <Label htmlFor="freelancer">Freelancer</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hourly_salary">Hourly Salary (NOK) *</Label>
          <Input 
            id="hourly_salary"
            type="number"
            value={formData.hourly_salary}
            onChange={(e) => onUpdate({ hourly_salary: parseFloat(e.target.value) || 0 })}
          />
          {errors.hourly_salary && <p className="text-sm text-red-500">{errors.hourly_salary}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="employed_percentage">Employed Percentage *</Label>
          <Input 
            id="employed_percentage"
            type="number"
            value={formData.employed_percentage}
            onChange={(e) => onUpdate({ employed_percentage: parseFloat(e.target.value) || 0 })}
            min="1"
            max="100"
          />
          {errors.employed_percentage && <p className="text-sm text-red-500">{errors.employed_percentage}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input 
            id="address"
            value={formData.address}
            onChange={(e) => onUpdate({ address: e.target.value })}
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
            />
            {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipcode">ZIP Code *</Label>
            <Input 
              id="zipcode"
              value={formData.zipcode}
              onChange={(e) => onUpdate({ zipcode: e.target.value })}
            />
            {errors.zipcode && <p className="text-sm text-red-500">{errors.zipcode}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Input 
            id="country"
            value={formData.country}
            onChange={(e) => onUpdate({ country: e.target.value })}
            placeholder="Norway"
          />
          {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
