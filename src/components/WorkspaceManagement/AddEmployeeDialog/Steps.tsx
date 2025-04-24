
import { Check } from 'lucide-react';

interface StepsProps {
  currentStep: number;
}

export function Steps({ currentStep }: StepsProps) {
  const steps = [
    'Basic Information',
    'Employment Details',
    'Payment Information'
  ];

  return (
    <div className="relative pb-8">
      <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200">
        <div
          className="absolute h-full bg-primary transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index + 1;
          const isCurrent = currentStep === index + 1;

          return (
            <div
              key={step}
              className="flex flex-col items-center"
            >
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isCompleted ? 'bg-primary text-primary-foreground' :
                    isCurrent ? 'bg-primary text-primary-foreground' :
                    'bg-gray-200 text-gray-400'}
                `}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="mt-2 text-sm">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
