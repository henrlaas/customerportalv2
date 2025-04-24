
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';

interface BasicInfoStepProps {
  formData: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  onUpdate: (data: Partial<typeof formData>) => void;
  onNext: () => void;
}

export function BasicInfoStep({ formData, onUpdate, onNext }: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    
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
        <h2 className="text-lg font-medium">Employee Basic Information</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input 
              id="first_name"
              value={formData.first_name}
              onChange={(e) => onUpdate({ first_name: e.target.value })}
            />
            {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input 
              id="last_name"
              value={formData.last_name}
              onChange={(e) => onUpdate({ last_name: e.target.value })}
            />
            {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input 
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <PhoneInput 
            id="phone_number"
            value={formData.phone_number}
            onChange={(value) => onUpdate({ phone_number: value })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          Next Step
        </Button>
      </div>
    </form>
  );
}
