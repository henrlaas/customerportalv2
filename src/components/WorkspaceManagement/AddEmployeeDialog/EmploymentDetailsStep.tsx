
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmploymentDetailsStepProps {
  formData: {
    employee_type: 'Employee' | 'Freelancer';
    hourly_salary: number;
    employed_percentage: number;
    team: string; // Add team to formData interface
  };
  onUpdate: (data: Partial<typeof formData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EmploymentDetailsStep({ formData, onUpdate, onNext, onBack }: EmploymentDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const teamOptions = [
    { value: 'Advisor', label: 'Advisor' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Advertiser', label: 'Advertiser' },
    { value: 'Designer', label: 'Designer' },
    { value: 'Branding', label: 'Branding' },
    { value: 'Developer', label: 'Developer' },
    { value: 'Other', label: 'Other' }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    onUpdate({ [field]: value });

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.hourly_salary) {
      newErrors.hourly_salary = 'Hourly salary is required';
    }
    
    if (!formData.employed_percentage) {
      newErrors.employed_percentage = 'Employment percentage is required';
    }

    if (!formData.team) {
      newErrors.team = 'Team is required';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Employment Details</h2>
        
        <div className="space-y-2">
          <Label htmlFor="employee_type">Employee Type *</Label>
          <Select 
            value={formData.employee_type} 
            onValueChange={(value) => handleInputChange('employee_type', value as 'Employee' | 'Freelancer')}
          >
            <SelectTrigger id="employee_type">
              <SelectValue placeholder="Select employee type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Employee">Employee</SelectItem>
              <SelectItem value="Freelancer">Freelancer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="team">Team *</Label>
          <Select 
            value={formData.team} 
            onValueChange={(value) => handleInputChange('team', value)}
          >
            <SelectTrigger id="team">
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              {teamOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.team && <p className="text-sm text-red-500">{errors.team}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hourly_salary">Hourly Salary (NOK) *</Label>
          <Input 
            id="hourly_salary"
            type="number" 
            min="0"
            value={formData.hourly_salary} 
            onChange={(e) => handleInputChange('hourly_salary', Number(e.target.value))}
          />
          {errors.hourly_salary && <p className="text-sm text-red-500">{errors.hourly_salary}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="employed_percentage">Employment Percentage (%) *</Label>
          <Input 
            id="employed_percentage"
            type="number" 
            min="0" 
            max="100"
            value={formData.employed_percentage} 
            onChange={(e) => handleInputChange('employed_percentage', Number(e.target.value))}
          />
          {errors.employed_percentage && <p className="text-sm text-red-500">{errors.employed_percentage}</p>}
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
