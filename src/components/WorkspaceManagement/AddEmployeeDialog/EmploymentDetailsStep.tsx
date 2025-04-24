
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmploymentDetailsStepProps {
  formData: {
    address: string;
    zipcode: string;
    country: string;
    employee_type: string;
    hourly_salary: number;
    employed_percentage: number;
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.zipcode) newErrors.zipcode = 'Zip code is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.employee_type) newErrors.employee_type = 'Employee type is required';
    if (!formData.hourly_salary) newErrors.hourly_salary = 'Hourly salary is required';
    if (!formData.employed_percentage) newErrors.employed_percentage = 'Employment percentage is required';
    else if (formData.employed_percentage <= 0 || formData.employed_percentage > 100)
      newErrors.employed_percentage = 'Employment percentage must be between 1 and 100';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
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
          />
          {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zipcode">Zip Code *</Label>
            <Input 
              id="zipcode"
              value={formData.zipcode}
              onChange={(e) => onUpdate({ zipcode: e.target.value })}
            />
            {errors.zipcode && <p className="text-sm text-red-500">{errors.zipcode}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input 
              id="country"
              value={formData.country}
              onChange={(e) => onUpdate({ country: e.target.value })}
            />
            {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee_type">Employee Type *</Label>
          <Select
            value={formData.employee_type}
            onValueChange={(value) => onUpdate({ employee_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select employee type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">Full Time</SelectItem>
              <SelectItem value="part_time">Part Time</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
              <SelectItem value="intern">Intern</SelectItem>
            </SelectContent>
          </Select>
          {errors.employee_type && <p className="text-sm text-red-500">{errors.employee_type}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hourly_salary">Hourly Rate (NOK) *</Label>
            <Input 
              id="hourly_salary"
              type="number"
              min="0"
              value={formData.hourly_salary || ''}
              onChange={(e) => onUpdate({ hourly_salary: parseFloat(e.target.value) || 0 })}
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
