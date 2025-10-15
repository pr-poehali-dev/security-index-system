import type { WizardFormData } from './OpoFormWizard';
import ObjectWizardDocumentsTab from '../ObjectWizardDocumentsTab';

interface Step5DocumentsProps {
  formData: WizardFormData;
  updateFormData: (data: Partial<WizardFormData>) => void;
}

export default function Step5Documents({ formData, updateFormData }: Step5DocumentsProps) {
  return (
    <ObjectWizardDocumentsTab
      documents={formData.documents}
      onChange={(documents) => updateFormData({ documents })}
    />
  );
}
