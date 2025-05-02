
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInfoStepProps {
  formData: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    team: string;
  };
  onUpdate: (data: Partial<BasicInfoStepProps['formData']>) => void;
  onNext: () => void;
  isEdit?: boolean;
}

export function BasicInfoStep({ formData, onUpdate, onNext, isEdit = false }: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) 
      newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Please enter a valid email';
    
    if (!formData.first_name) 
      newErrors.first_name = 'First name is required';
    
    if (!formData.last_name) 
      newErrors.last_name = 'Last name is required';
      
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };
  
  // Team options
  const teamOptions = [
    "Advisor", 
    "Marketing", 
    "Sales", 
    "Advertiser", 
    "Designer", 
    "Branding", 
    "Developer", 
    "Other"
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Basic Information</h2>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input 
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            disabled={isEdit}
            placeholder="employee@company.com"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input 
            id="first_name"
            value={formData.first_name}
            onChange={(e) => onUpdate({ first_name: e.target.value })}
            placeholder="John"
          />
          {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input 
            id="last_name"
            value={formData.last_name}
            onChange={(e) => onUpdate({ last_name: e.target.value })}
            placeholder="Doe"
          />
          {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input 
            id="phone_number"
            value={formData.phone_number}
            onChange={(e) => onUpdate({ phone_number: e.target.value })}
            placeholder="+47 123 45 678"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="team">Team</Label>
          <Select 
            value={formData.team} 
            onValueChange={(value) => onUpdate({ team: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {teamOptions.map((team) => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
