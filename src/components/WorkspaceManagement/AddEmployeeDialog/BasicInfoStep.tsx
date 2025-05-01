
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmployeeFormData } from '@/types/employee';

interface BasicInfoStepProps {
  formData: EmployeeFormData;
  onUpdate: (data: Partial<EmployeeFormData>) => void;
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
    
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Basic Information</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => onUpdate({ firstName: e.target.value })}
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => onUpdate({ lastName: e.target.value })}
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
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
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onUpdate({ phone: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
