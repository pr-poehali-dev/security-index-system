import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useCatalogStore } from '@/stores/catalogStore';
import type { IndustrialObject } from '@/types/catalog';
import Step1BasicInfo from './Step1BasicInfo';
import Step2DangerIdentification from './Step2DangerIdentification';
import Step3Classification from './Step3Classification';
import Step4Composition from './Step4Composition';
import Step5Documents from './Step5Documents';
import Step6Review from './Step6Review';
import type { ObjectDocument } from '@/types/catalog';

interface OpoFormWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'create' | 'edit';
  object?: IndustrialObject;
}

export interface WizardFormData {
  name: string;
  registrationNumber: string;
  typicalNameId: string;
  industryCode: string;
  organizationId: string;
  ownerId: string;
  commissioningDate: string;
  status: 'active' | 'conservation' | 'liquidated';
  
  postalCode: string;
  region: string;
  city: string;
  street: string;
  building: string;
  oktmo: string;
  
  responsiblePersonId: string;
  
  dangerSigns: string[];
  
  classifications: string[];
  hazardClass: 'I' | 'II' | 'III' | 'IV' | '';
  hazardClassJustification: string;
  
  licensedActivities: string[];
  
  documents: ObjectDocument[];
  
  description: string;
}

const initialFormData: WizardFormData = {
  name: '',
  registrationNumber: '',
  typicalNameId: '',
  industryCode: '',
  organizationId: '',
  ownerId: '',
  commissioningDate: '',
  status: 'active',
  postalCode: '',
  region: '',
  city: '',
  street: '',
  building: '',
  oktmo: '',
  responsiblePersonId: '',
  dangerSigns: [],
  classifications: [],
  hazardClass: '',
  hazardClassJustification: '',
  licensedActivities: [],
  documents: [],
  description: ''
};

const steps = [
  { id: 1, title: 'Основные сведения', icon: 'FileText' },
  { id: 2, title: 'Идентификация опасности', icon: 'AlertTriangle' },
  { id: 3, title: 'Классификация', icon: 'Tags' },
  { id: 4, title: 'Состав ОПО', icon: 'Layers' },
  { id: 5, title: 'Документы', icon: 'File' },
  { id: 6, title: 'Проверка', icon: 'CheckCircle' }
];

export default function OpoFormWizard({ open, onOpenChange, mode = 'create', object }: OpoFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(initialFormData);
  const { addObject, updateObject } = useCatalogStore();

  useEffect(() => {
    if (mode === 'edit' && object) {
      setFormData({
        name: object.name,
        registrationNumber: object.registrationNumber,
        typicalNameId: object.typicalNameId || '',
        industryCode: object.industryCode || '',
        organizationId: object.organizationId,
        ownerId: object.ownerId || '',
        commissioningDate: object.commissioningDate,
        status: object.status,
        postalCode: object.detailedAddress?.postalCode || '',
        region: object.detailedAddress?.region || '',
        city: object.detailedAddress?.city || '',
        street: object.detailedAddress?.street || '',
        building: object.detailedAddress?.building || '',
        oktmo: object.detailedAddress?.oktmo || '',
        responsiblePersonId: object.responsiblePersonId || '',
        dangerSigns: object.dangerSigns || [],
        classifications: object.classifications || [],
        hazardClass: object.hazardClass || '',
        hazardClassJustification: object.hazardClassJustification || '',
        licensedActivities: object.licensedActivities || [],
        documents: object.documents || [],
        description: object.description || ''
      });
    } else if (mode === 'create') {
      setFormData(initialFormData);
      setCurrentStep(1);
    }
  }, [mode, object, open]);

  const updateFormData = (data: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const objectData = {
      tenantId: 'tenant-1',
      name: formData.name,
      registrationNumber: formData.registrationNumber,
      type: 'opo' as const,
      organizationId: formData.organizationId,
      commissioningDate: formData.commissioningDate,
      status: formData.status,
      location: {
        address: `${formData.postalCode ? formData.postalCode + ', ' : ''}${formData.region}, ${formData.city}, ${formData.street}, ${formData.building}`
      },
      responsiblePerson: formData.responsiblePersonId,
      typicalNameId: formData.typicalNameId,
      industryCode: formData.industryCode,
      detailedAddress: {
        postalCode: formData.postalCode,
        region: formData.region,
        city: formData.city,
        street: formData.street,
        building: formData.building,
        oktmo: formData.oktmo,
        fullAddress: `${formData.postalCode ? formData.postalCode + ', ' : ''}${formData.region}, ${formData.city}, ${formData.street}, ${formData.building}`
      },
      ownerId: formData.ownerId,
      dangerSigns: formData.dangerSigns,
      classifications: formData.classifications,
      hazardClass: formData.hazardClass || undefined,
      hazardClassJustification: formData.hazardClassJustification,
      licensedActivities: formData.licensedActivities,
      documents: formData.documents,
      description: formData.description
    };

    if (mode === 'create') {
      addObject(objectData);
    } else if (object) {
      updateObject(object.id, objectData);
    }

    onOpenChange(false);
    setCurrentStep(1);
    setFormData(initialFormData);
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Создание ОПО' : 'Редактирование ОПО'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Шаг {currentStep} из {steps.length}</span>
              <span>{steps[currentStep - 1].title}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                  currentStep === step.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : currentStep > step.id
                    ? 'bg-muted border-muted-foreground/20 hover:bg-muted/80'
                    : 'border-muted-foreground/20 hover:bg-muted/50'
                }`}
              >
                <Icon name={step.icon as any} size={16} />
                <span className="text-sm">{step.title}</span>
                {currentStep > step.id && (
                  <Icon name="Check" size={14} className="text-green-600" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {currentStep === 1 && (
              <Step1BasicInfo formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 2 && (
              <Step2DangerIdentification formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 3 && (
              <Step3Classification formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 4 && (
              <Step4Composition formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 5 && (
              <Step5Documents formData={formData} updateFormData={updateFormData} />
            )}
            {currentStep === 6 && (
              <Step6Review formData={formData} />
            )}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <Icon name="ChevronLeft" className="mr-2" size={16} />
              Назад
            </Button>
            
            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Далее
                <Icon name="ChevronRight" className="ml-2" size={16} />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <Icon name="Save" className="mr-2" size={16} />
                Сохранить
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}