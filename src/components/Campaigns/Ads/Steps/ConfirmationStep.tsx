
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { AdFormData, Platform } from '../../types/campaign';

interface ConfirmationStepProps {
  form: UseFormReturn<AdFormData>;
  platform: Platform;
}

export function ConfirmationStep({ form, platform }: ConfirmationStepProps) {
  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Ready to Create Your Ad?</h3>
        <p className="text-muted-foreground">
          Please review your ad details before proceeding. Once created, you can still edit the ad later.
        </p>
      </motion.div>

      <Card className="border-primary/10 shadow-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-6 space-y-4">
          <div className="grid gap-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ad Name:</span>
              <span className="font-medium">{form.watch('name')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform:</span>
              <span className="font-medium">{platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Landing Page:</span>
              <span className="font-medium">{form.watch('url') || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Call to Action:</span>
              <span className="font-medium">{form.watch('cta_button') || 'None'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
