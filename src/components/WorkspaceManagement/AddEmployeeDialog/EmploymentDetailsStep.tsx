
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountrySelector } from '@/components/ui/country-selector';
import { EmployeeFormData } from '@/types/employee';

interface EmploymentDetailsStepProps {
  formData: EmployeeFormData;
  onUpdate: (data: Partial<EmployeeFormData>) => void;
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
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.employeeType) newErrors.employeeType = 'Employee type is required';
    if (!formData.hourlySalary) newErrors.hourlySalary = 'Hourly salary is required';
    if (!formData.employedPercentage) newErrors.employedPercentage = 'Employment percentage is required';
    else if (formData.employedPercentage <= 0 || formData.employedPercentage > 100) {
      newErrors.employedPercentage = 'Employment percentage must be between 1 and 100';
    }
    
    if (formData.employeeType === 'Freelancer' && !formData.paycheckSolution) {
      newErrors.paycheckSolution = 'Paycheck solution is required for Freelancers';
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
          <CountrySelector
            value={formData.country}
            onValueChange={(value) => onUpdate({ country: value })}
            error={errors.country}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employeeType">Employee Type *</Label>
          <Select
            value={formData.employeeType}
            onValueChange={(value: 'Employee' | 'Freelancer') => onUpdate({ 
              employeeType: value,
              paycheckSolution: value === 'Employee' ? undefined : formData.paycheckSolution 
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
          {errors.employeeType && <p className="text-sm text-red-500">{errors.employeeType}</p>}
        </div>

        {formData.employeeType === 'Freelancer' && (
          <div className="space-y-2">
            <Label htmlFor="paycheckSolution">Paycheck Solution *</Label>
            <Input 
              id="paycheckSolution"
              value={formData.paycheckSolution || ''}
              onChange={(e) => onUpdate({ paycheckSolution: e.target.value })}
              placeholder="Enter paycheck solution details"
              className={errors.paycheckSolution ? 'border-red-500' : ''}
            />
            {errors.paycheckSolution && <p className="text-sm text-red-500">{errors.paycheckSolution}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hourlySalary">Hourly Rate (NOK) *</Label>
            <Input 
              id="hourlySalary"
              type="number"
              min="0"
              value={formData.hourlySalary || ''}
              onChange={(e) => onUpdate({ hourlySalary: parseFloat(e.target.value) || 0 })}
              className={errors.hourlySalary ? 'border-red-500' : ''}
            />
            {errors.hourlySalary && <p className="text-sm text-red-500">{errors.hourlySalary}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employedPercentage">Employment Percentage (%) *</Label>
            <Input 
              id="employedPercentage"
              type="number"
              min="1"
              max="100"
              value={formData.employedPercentage || ''}
              onChange={(e) => onUpdate({ employedPercentage: parseInt(e.target.value) || 0 })}
              className={errors.employedPercentage ? 'border-red-500' : ''}
            />
            {errors.employedPercentage && <p className="text-sm text-red-500">{errors.employedPercentage}</p>}
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
