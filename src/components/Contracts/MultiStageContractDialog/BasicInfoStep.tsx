
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicInfoStepProps {
  contractData: {
    title: string;
    value: string;
    status: string;
    start_date: string;
    end_date: string;
  };
  updateContractData: (data: Partial<typeof contractData>) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ contractData, updateContractData }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Contract Information</h2>
      <p className="text-sm text-muted-foreground">
        Enter the basic information about your contract.
      </p>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Contract Title *</Label>
          <Input
            id="title"
            value={contractData.title}
            onChange={(e) => updateContractData({ title: e.target.value })}
            placeholder="Website Redesign Agreement"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="value">Contract Value ($)</Label>
          <Input
            id="value"
            type="number"
            value={contractData.value}
            onChange={(e) => updateContractData({ value: e.target.value })}
            placeholder="1000"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={contractData.start_date}
              onChange={(e) => updateContractData({ start_date: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={contractData.end_date}
              onChange={(e) => updateContractData({ end_date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={contractData.status}
            onValueChange={(value) => updateContractData({ status: value })}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
