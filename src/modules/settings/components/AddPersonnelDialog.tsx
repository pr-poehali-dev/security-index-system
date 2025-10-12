import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import type { EducationLevel, PersonnelType } from '@/types';
import PersonnelTypeSelector from './PersonnelTypeSelector';
import PersonalDataTab from './tabs/PersonalDataTab';
import PositionDataTab from './PositionDataTab';
import CertificationsTab from './tabs/CertificationsTab';

interface AddPersonnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CertificationForm {
  competencyId: string;
  issueDate: string;
  expiryDate: string;
  protocolNumber: string;
  issuedBy: string;
}

export default function AddPersonnelDialog({ open, onOpenChange }: AddPersonnelDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { 
    addPerson, 
    addPersonnel,
    addCertification,
    getOrganizationsByTenant,
    getExternalOrganizationsByType,
    getDepartmentsByOrganization,
    getPositionsByTenant,
    getCompetenciesDirByTenant
  } = useSettingsStore();
  const { toast } = useToast();

  const tenantOrgs = getOrganizationsByTenant(user!.tenantId!);
  const contractorOrgs = getExternalOrganizationsByType(user!.tenantId!, 'contractor');
  const tenantPositions = getPositionsByTenant(user!.tenantId!);
  const tenantCompetencies = getCompetenciesDirByTenant(user!.tenantId!);

  const [personnelType, setPersonnelType] = useState<PersonnelType>('employee');

  const [personData, setPersonData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    snils: '',
    inn: '',
    email: '',
    phone: '',
    address: '',
    educationLevel: 'no_data' as EducationLevel
  });

  const [personnelData, setPersonnelData] = useState({
    organizationId: '',
    departmentId: '',
    positionId: '',
    role: 'Manager' as 'Auditor' | 'Manager' | 'Director' | 'Contractor',
    hireDate: '',
    requiredCompetencies: [] as string[]
  });

  const [certifications, setCertifications] = useState<CertificationForm[]>([]);

  const departments = personnelData.organizationId 
    ? getDepartmentsByOrganization(personnelData.organizationId)
    : [];

  const handlePersonnelTypeChange = (type: PersonnelType) => {
    setPersonnelType(type);
    setPersonnelData({ 
      ...personnelData, 
      organizationId: '', 
      departmentId: '', 
      role: type === 'contractor' ? 'Contractor' : 'Manager' 
    });
  };

  const handlePersonDataUpdate = (field: string, value: string | EducationLevel) => {
    setPersonData({ ...personData, [field]: value });
  };

  const handlePersonnelDataUpdate = (field: string, value: string) => {
    setPersonnelData({ ...personnelData, [field]: value });
  };

  const handleOrganizationChange = (value: string) => {
    setPersonnelData({ ...personnelData, organizationId: value, departmentId: '' });
  };

  const addCertificationRow = () => {
    setCertifications([...certifications, {
      competencyId: '',
      issueDate: '',
      expiryDate: '',
      protocolNumber: '',
      issuedBy: ''
    }]);
  };

  const removeCertificationRow = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const updateCertification = (index: number, field: keyof CertificationForm, value: string) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!personData.lastName || !personData.firstName || !personnelData.positionId || !personnelData.organizationId) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля: Фамилия, Имя, Организация, Должность',
        variant: 'destructive'
      });
      return;
    }

    const personId = `person-${Date.now()}`;
    
    addPerson({
      ...personData,
      tenantId: user!.tenantId!,
      status: 'active'
    });

    addPersonnel({
      tenantId: user!.tenantId!,
      personId,
      positionId: personnelData.positionId,
      organizationId: personnelData.organizationId,
      departmentId: personnelData.departmentId || undefined,
      personnelType,
      role: personnelType === 'contractor' ? 'Contractor' : personnelData.role,
      requiredCompetencies: personnelData.requiredCompetencies.length > 0 ? personnelData.requiredCompetencies : undefined,
      status: 'active',
      hireDate: personnelData.hireDate || undefined
    });

    certifications.forEach(cert => {
      if (cert.competencyId && cert.issueDate && cert.expiryDate && cert.protocolNumber) {
        addCertification({
          tenantId: user!.tenantId!,
          personId,
          competencyId: cert.competencyId,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          protocolNumber: cert.protocolNumber,
          issuedBy: cert.issuedBy || undefined
        });
      }
    });

    toast({
      title: 'Успешно',
      description: personnelType === 'employee' ? 'Сотрудник добавлен в систему' : 'Сотрудник подрядчика добавлен в систему'
    });

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setPersonnelType('employee');
    setPersonData({
      lastName: '',
      firstName: '',
      middleName: '',
      birthDate: '',
      snils: '',
      inn: '',
      email: '',
      phone: '',
      address: '',
      educationLevel: 'no_data'
    });
    setPersonnelData({
      organizationId: '',
      departmentId: '',
      positionId: '',
      role: 'Manager',
      hireDate: '',
      requiredCompetencies: []
    });
    setCertifications([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить сотрудника</DialogTitle>
          <DialogDescription>
            Заполните личные данные, должность и аттестации сотрудника
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <PersonnelTypeSelector
            personnelType={personnelType}
            onTypeChange={handlePersonnelTypeChange}
          />

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
              <TabsTrigger value="personal" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon name="User" size={20} />
                <span className="text-xs font-medium text-center leading-tight">Личные<br/>данные</span>
              </TabsTrigger>
              <TabsTrigger value="position" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon name="Briefcase" size={20} />
                <span className="text-xs font-medium">Должность</span>
              </TabsTrigger>
              <TabsTrigger value="certifications" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Icon name="Award" size={20} />
                <span className="text-xs font-medium">Аттестации</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <PersonalDataTab
                personData={personData}
                onUpdate={handlePersonDataUpdate}
              />
            </TabsContent>

            <TabsContent value="position">
              <PositionDataTab
                personnelType={personnelType}
                personnelData={personnelData}
                tenantOrgs={tenantOrgs}
                contractorOrgs={contractorOrgs}
                departments={departments}
                tenantPositions={tenantPositions}
                onUpdate={handlePersonnelDataUpdate}
                onOrganizationChange={handleOrganizationChange}
              />
            </TabsContent>

            <TabsContent value="certifications">
              <CertificationsTab
                certifications={certifications}
                tenantCompetencies={tenantCompetencies}
                onAddCertification={addCertificationRow}
                onRemoveCertification={removeCertificationRow}
                onUpdateCertification={updateCertification}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              Добавить сотрудника
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}