import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useContractorsStore } from '../../stores/contractorsStore';
import { Contractor, ContractorFormData } from '../../types/contractors';
import BasicInfoSection from './form-sections/BasicInfoSection';
import ContactInfoSection from './form-sections/ContactInfoSection';
import ContractSection from './form-sections/ContractSection';
import PermissionsSection from './form-sections/PermissionsSection';
import TrainingCenterSection from './form-sections/TrainingCenterSection';
import AdditionalInfoSection from './form-sections/AdditionalInfoSection';

interface ContractorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor?: Contractor;
  onClose?: () => void;
}

const ContractorFormDialog = ({
  open,
  onOpenChange,
  contractor,
  onClose,
}: ContractorFormDialogProps) => {
  const { createContractor, updateContractor, loading } = useContractorsStore();
  const [workTypesInput, setWorkTypesInput] = useState('');
  const [accreditationsInput, setAccreditationsInput] = useState('');

  const [formData, setFormData] = useState<ContractorFormData>({
    name: '',
    type: 'contractor',
    inn: '',
    kpp: '',
    legalAddress: '',
    actualAddress: '',
    directorName: '',
    contactPhone: '',
    contactEmail: '',
    contractNumber: '',
    contractDate: '',
    contractExpiry: '',
    contractAmount: undefined,
    allowedWorkTypes: [],
    sroNumber: '',
    sroExpiry: '',
    insuranceNumber: '',
    insuranceExpiry: '',
    status: 'active',
    notes: '',
    accreditations: [],
    website: '',
    rating: 0,
  });

  useEffect(() => {
    if (contractor) {
      setFormData({
        name: contractor.name,
        type: contractor.type || 'contractor',
        inn: contractor.inn,
        kpp: contractor.kpp,
        legalAddress: contractor.legalAddress,
        actualAddress: contractor.actualAddress,
        directorName: contractor.directorName,
        contactPhone: contractor.contactPhone,
        contactEmail: contractor.contactEmail,
        contractNumber: contractor.contractNumber,
        contractDate: contractor.contractDate,
        contractExpiry: contractor.contractExpiry,
        contractAmount: contractor.contractAmount,
        allowedWorkTypes: contractor.allowedWorkTypes,
        sroNumber: contractor.sroNumber,
        sroExpiry: contractor.sroExpiry,
        insuranceNumber: contractor.insuranceNumber,
        insuranceExpiry: contractor.insuranceExpiry,
        status: contractor.status,
        notes: contractor.notes,
        accreditations: contractor.accreditations || [],
        website: contractor.website || '',
        rating: contractor.rating || 0,
      });
      setWorkTypesInput(contractor.allowedWorkTypes?.join(', ') || '');
      setAccreditationsInput(contractor.accreditations?.join(', ') || '');
    } else {
      setFormData({
        name: '',
        type: 'contractor',
        inn: '',
        kpp: '',
        legalAddress: '',
        actualAddress: '',
        directorName: '',
        contactPhone: '',
        contactEmail: '',
        contractNumber: '',
        contractDate: '',
        contractExpiry: '',
        contractAmount: undefined,
        allowedWorkTypes: [],
        sroNumber: '',
        sroExpiry: '',
        insuranceNumber: '',
        insuranceExpiry: '',
        status: 'active',
        notes: '',
        accreditations: [],
        website: '',
        rating: 0,
      });
      setWorkTypesInput('');
      setAccreditationsInput('');
    }
  }, [contractor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const workTypes = workTypesInput
      .split(',')
      .map((type) => type.trim())
      .filter((type) => type.length > 0);

    const accreditations = accreditationsInput
      .split(',')
      .map((acc) => acc.trim())
      .filter((acc) => acc.length > 0);

    const dataToSubmit = {
      ...formData,
      allowedWorkTypes: workTypes,
      accreditations,
    };

    if (contractor) {
      await updateContractor(contractor.id, dataToSubmit);
    } else {
      await createContractor(dataToSubmit);
    }

    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contractor ? 'Редактировать подрядчика' : 'Добавить подрядчика'}
          </DialogTitle>
          <DialogDescription>
            {contractor
              ? 'Измените данные подрядной организации'
              : 'Заполните информацию о новой подрядной организации'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <BasicInfoSection formData={formData} setFormData={setFormData} />
          
          <ContactInfoSection formData={formData} setFormData={setFormData} />
          
          <ContractSection formData={formData} setFormData={setFormData} />
          
          <PermissionsSection 
            formData={formData} 
            setFormData={setFormData}
            workTypesInput={workTypesInput}
            setWorkTypesInput={setWorkTypesInput}
          />
          
          <TrainingCenterSection 
            formData={formData} 
            setFormData={setFormData}
            accreditationsInput={accreditationsInput}
            setAccreditationsInput={setAccreditationsInput}
          />
          
          <AdditionalInfoSection formData={formData} setFormData={setFormData} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Icon name="Loader2" className="mr-2 animate-spin" size={16} />}
              {contractor ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContractorFormDialog;
