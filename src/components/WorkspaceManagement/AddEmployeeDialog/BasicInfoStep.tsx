
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { toast } from "sonner";

// Define available team options
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

interface BasicInfoStepProps {
  formData: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    zipcode: string;
    country: string;
    city: string;
    team: string;
  };
  onUpdate: (data: Partial<typeof formData>) => void;
  onNext: () => void;
  isEdit?: boolean;
}

export function BasicInfoStep({ formData, onUpdate, onNext, isEdit = false }: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const schema = z.object({
      email: isEdit ? z.string() : z.string().email("Invalid email address"),
      first_name: z.string().min(1, "First name is required"),
      last_name: z.string().min(1, "Last name is required"),
      phone_number: z.string().optional(),
      address: z.string().min(1, "Address is required"),
      city: z.string().min(1, "City is required"),
      zipcode: z.string().min(1, "Zip code is required"),
      country: z.string().min(1, "Country is required"),
      team: z.string().optional()
    });

    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Enter the basic employee information.
        </p>
      </div>

      <div className="grid gap-4">
        {!isEdit && (
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              placeholder="employee@company.com"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => onUpdate({ first_name: e.target.value })}
              placeholder="First name"
            />
            {errors.first_name && (
              <p className="text-sm text-red-500">{errors.first_name}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => onUpdate({ last_name: e.target.value })}
              placeholder="Last name"
            />
            {errors.last_name && (
              <p className="text-sm text-red-500">{errors.last_name}</p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            value={formData.phone_number}
            onChange={(e) => onUpdate({ phone_number: e.target.value })}
            placeholder="+47 123 45 678"
          />
          {errors.phone_number && (
            <p className="text-sm text-red-500">{errors.phone_number}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="team">Team</Label>
          <Select
            value={formData.team || ""}
            onValueChange={(value) => onUpdate({ team: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {teamOptions.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Address Information</h4>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => onUpdate({ address: e.target.value })}
                placeholder="Street address"
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => onUpdate({ city: e.target.value })}
                  placeholder="City"
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="zipcode">Zip Code</Label>
                <Input
                  id="zipcode"
                  value={formData.zipcode}
                  onChange={(e) => onUpdate({ zipcode: e.target.value })}
                  placeholder="Zip code"
                />
                {errors.zipcode && (
                  <p className="text-sm text-red-500">{errors.zipcode}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => onUpdate({ country: e.target.value })}
                placeholder="Country"
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  );
}
