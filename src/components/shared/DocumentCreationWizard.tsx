import { useState, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon?: string;
  validate?: () => boolean | string;
  component: ReactNode;
}

export interface DocumentCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  steps: WizardStep[];
  onComplete: () => void | Promise<void>;
  isSubmitting?: boolean;
}

export default function DocumentCreationWizard({
  open,
  onOpenChange,
  title,
  description,
  steps,
  onComplete,
  isSubmitting = false,
}: DocumentCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    const step = steps[currentStep];
    
    if (step.validate) {
      const validation = step.validate();
      if (validation === false || typeof validation === 'string') {
        return;
      }
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    const step = steps[currentStep];
    
    if (step.validate) {
      const validation = step.validate();
      if (validation === false || typeof validation === 'string') {
        return;
      }
    }
    
    await onComplete();
  };

  const handleClose = () => {
    setCurrentStep(0);
    onOpenChange(false);
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {currentStepData.icon && <Icon name={currentStepData.icon} size={24} />}
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="flex items-center gap-2 py-4 border-y">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    index < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {index < currentStep ? (
                    <Icon name="Check" size={16} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium truncate',
                      index === currentStep ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-[2px] flex-1 mx-2 transition-colors',
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
              <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
            </div>
            <div>{currentStepData.component}</div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isFirstStep || isSubmitting}
          >
            <Icon name="ChevronLeft" size={16} className="mr-1" />
            Назад
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Отмена
            </Button>

            {!isLastStep ? (
              <Button onClick={handleNext} disabled={isSubmitting}>
                Далее
                <Icon name="ChevronRight" size={16} className="ml-1" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <Icon name="Check" size={16} className="mr-2" />
                    Создать
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
