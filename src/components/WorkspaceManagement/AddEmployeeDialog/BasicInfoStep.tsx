
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
  onUpdate: (data: Partial<BasicInfoStepProps['formData']>) => void;
  onNext: () => void;
  isEdit?: boolean;
}

export function BasicInfoStep({ 
  formData, 
  onUpdate, 
  onNext, 
  isEdit = false 
}: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!isEdit && !formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isEdit && !formData.email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  // Initialize phone number with +47 prefix if not already set
  if (!formData.phone_number) {
    onUpdate({ phone_number: '+47' });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Basic Information</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => onUpdate({ first_name: e.target.value })}
              className={errors.first_name ? 'border-red-500' : ''}
            />
            {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => onUpdate({ last_name: e.target.value })}
              className={errors.last_name ? 'border-red-500' : ''}
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
            className={errors.email ? 'border-red-500' : ''}
            disabled={isEdit}
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
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
