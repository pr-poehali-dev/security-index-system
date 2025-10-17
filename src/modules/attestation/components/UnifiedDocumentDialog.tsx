/**
 * UnifiedDocumentDialog - универсальный диалог создания документов
 * 
 * Заменяет старые диалоги:
 * - CreateOrderDialog
 * - CreateAttestationOrderDialog
 * - CreateTrainingDialog
 * 
 * Использование:
 * ```tsx
 * // Создание любого типа документа (с выбором типа)
 * <UnifiedDocumentDialog 
 *   open={open} 
 *   onOpenChange={setOpen} 
 * />
 * 
 * // Создание приказа (без шага выбора типа)
 * <UnifiedDocumentDialog 
 *   open={open} 
 *   onOpenChange={setOpen}
 *   documentType="order"
 * />
 * 
 * // Создание обучения (без шага выбора типа)
 * <UnifiedDocumentDialog 
 *   open={open} 
 *   onOpenChange={setOpen}
 *   documentType="training"
 * />
 * ```
 */
import { useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAttestationStore } from '@/stores/certificationStore';
import { getCertificationStatus } from '@/lib/utils/personnelUtils';
import { useDocumentsStore } from '@/stores/documentsStore';
import { ChecklistDocumentStatus } from '@/types/documentStatus';
import DocumentCreationWizard, { WizardStep } from '@/components/shared/DocumentCreationWizard';
import TypeSelectionStep, { TypeOption } from '@/components/shared/wizard-steps/TypeSelectionStep';
import BasicInfoStep, { BasicInfoData } from '@/components/shared/wizard-steps/BasicInfoStep';
import EmployeeSelectionStep, { Employee, CertificationStatusFilter } from '@/components/shared/wizard-steps/EmployeeSelectionStep';
import TrainingDetailsStep, { TrainingDetailsData } from '@/components/shared/wizard-steps/TrainingDetailsStep';
import ContractorDialog from '@/modules/settings/components/ContractorDialog';
import { getPersonnelFullInfo } from '@/lib/utils/personnelUtils';
import type { OrderDocument, TrainingDocument } from '@/stores/documentsStore';

interface UnifiedDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType?: 'order' | 'training';
}

const documentTypes: TypeOption[] = [
  {
    value: 'attestation',
    label: 'Аттестация',
    icon: 'Award',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
    description: 'Проведение аттестации сотрудников по требованиям',
  },
  {
    value: 'training',
    label: 'Обучение',
    icon: 'GraduationCap',
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
    description: 'Направление сотрудников на обучение',
  },
  {
    value: 'suspension',
    label: 'Отстранение',
    icon: 'Ban',
    color: 'text-red-600 bg-red-100 dark:bg-red-900',
    description: 'Временное отстранение сотрудников от работы',
  },
];

const trainingTypes: TypeOption[] = [
  {
    value: 'dpo_center',
    label: 'ДПО в учебном центре',
    icon: 'Building2',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
    description: 'Дополнительное профессиональное образование',
  },
  {
    value: 'training_center',
    label: 'Тренинг в учебном центре',
    icon: 'Users',
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
    description: 'Очный тренинг в учебном центре',
  },
  {
    value: 'training_lms',
    label: 'Тренинг в СДО ИСП',
    icon: 'Monitor',
    color: 'text-green-600 bg-green-100 dark:bg-green-900',
    description: 'Онлайн-обучение в системе дистанционного обучения',
  },
];

export default function UnifiedDocumentDialog({
  open,
  onOpenChange,
  documentType,
}: UnifiedDocumentDialogProps) {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const personnel = useSettingsStore((state) => state.personnel);
  const people = useSettingsStore((state) => state.people);
  const positions = useSettingsStore((state) => state.positions);
  const departments = useSettingsStore((state) => state.departments);
  const contractors = useSettingsStore((state) => state.contractors);
  const { attestations } = useAttestationStore();
  
  const trainingOrganizations = useMemo(() => {
    if (!user?.tenantId) return [];
    return contractors
      .filter(c => c.tenantId === user.tenantId && c.type === 'training_center')
      .map(contractor => ({
        id: contractor.id,
        name: contractor.contractorName,
      }));
  }, [user?.tenantId, contractors]);

  const handleAddOrganization = useCallback(() => {
    setContractorDialogOpen(true);
  }, []);

  const handleContractorDialogClose = useCallback((open: boolean) => {
    setContractorDialogOpen(open);
  }, []);
  const { addDocument } = useDocumentsStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubType, setSelectedSubType] = useState('');
  const [basicInfo, setBasicInfo] = useState<BasicInfoData>({
    number: '',
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
  });
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [trainingDetails, setTrainingDetails] = useState<TrainingDetailsData>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    organizationId: '',
    cost: '0',
    program: '',
  });
  const [contractorDialogOpen, setContractorDialogOpen] = useState(false);

  const tenantPersonnel = useMemo(() => 
    user?.tenantId ? personnel.filter(p => p.tenantId === user.tenantId) : []
  , [user?.tenantId, personnel]);

  const employees = useMemo<Employee[]>(() => {
    return tenantPersonnel.map((p) => {
      const info = getPersonnelFullInfo(p, people, positions);
      const dept = departments.find((d) => d.id === p.departmentId);
      const employeeCerts = attestations.filter(c => c.personnelId === p.id);

      return {
        id: p.id,
        name: info.fullName,
        position: info.position,
        department: dept?.name || '—',
        certifications: employeeCerts,
      };
    });
  }, [tenantPersonnel, people, positions, departments, attestations]);

  const getEmployeeCertStatus = (employee: Employee): CertificationStatusFilter => {
    if (!employee.certifications || employee.certifications.length === 0) {
      return 'missing';
    }

    let hasExpired = false;
    let hasExpiring = false;
    let hasValid = false;

    employee.certifications.forEach((cert: any) => {
      const { status } = getCertificationStatus(cert.expiryDate);
      if (status === 'expired') hasExpired = true;
      else if (status === 'expiring') hasExpiring = true;
      else if (status === 'valid') hasValid = true;
    });

    if (hasExpired) return 'expired';
    if (hasExpiring) return 'expiring';
    if (hasValid) return 'valid';
    return 'all';
  };

  const isTrainingFlow = selectedType === 'training';

  const steps = useMemo<WizardStep[]>(() => {
    const baseSteps: WizardStep[] = [];

    if (!documentType) {
      baseSteps.push({
        id: 'type',
        title: 'Тип документа',
        description: 'Выберите тип создаваемого документа',
        icon: 'FileText',
        validate: () => {
          if (!selectedType) {
            toast({
              title: 'Ошибка',
              description: 'Выберите тип документа',
              variant: 'destructive',
            });
            return false;
          }
          return true;
        },
        component: (
          <TypeSelectionStep options={documentTypes} selected={selectedType} onSelect={setSelectedType} />
        ),
      });
    }

    if (isTrainingFlow) {
      baseSteps.push({
        id: 'training-type',
        title: 'Тип обучения',
        description: 'Выберите тип обучения',
        icon: 'GraduationCap',
        validate: () => {
          if (!selectedSubType) {
            toast({
              title: 'Ошибка',
              description: 'Выберите тип обучения',
              variant: 'destructive',
            });
            return false;
          }
          return true;
        },
        component: (
          <TypeSelectionStep
            options={trainingTypes}
            selected={selectedSubType}
            onSelect={setSelectedSubType}
          />
        ),
      });
    }

    baseSteps.push({
      id: 'basic-info',
      title: 'Основная информация',
      description: 'Заполните основные данные документа',
      icon: 'FileText',
      validate: () => {
        if (!basicInfo.number || !basicInfo.date || !basicInfo.title) {
          toast({
            title: 'Ошибка',
            description: 'Заполните все обязательные поля',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      },
      component: (
        <BasicInfoStep
          data={basicInfo}
          onChange={setBasicInfo}
          titleLabel={isTrainingFlow ? 'Название обучения' : 'Название приказа'}
          titlePlaceholder={
            isTrainingFlow
              ? 'Например: Промышленная безопасность А.1'
              : 'Например: О направлении на аттестацию'
          }
        />
      ),
    });

    if (isTrainingFlow) {
      baseSteps.push({
        id: 'training-details',
        title: 'Детали обучения',
        description: 'Укажите параметры обучения',
        icon: 'Settings',
        validate: () => {
          if (!trainingDetails.startDate || !trainingDetails.endDate || !trainingDetails.organizationId || !trainingDetails.cost) {
            toast({
              title: 'Ошибка',
              description: 'Заполните все обязательные поля обучения',
              variant: 'destructive',
            });
            return false;
          }
          return true;
        },
        component: (
          <TrainingDetailsStep
            data={trainingDetails}
            onChange={setTrainingDetails}
            organizations={trainingOrganizations}
            onAddOrganization={handleAddOrganization}
          />
        ),
      });
    }

    baseSteps.push({
      id: 'employees',
      title: 'Выбор сотрудников',
      description: 'Выберите сотрудников для документа',
      icon: 'Users',
      validate: () => {
        if (selectedEmployees.length === 0) {
          toast({
            title: 'Ошибка',
            description: 'Выберите хотя бы одного сотрудника',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      },
      component: (
        <EmployeeSelectionStep
          employees={employees}
          selected={selectedEmployees}
          onSelect={setSelectedEmployees}
          enableCertificationFilter={selectedType === 'attestation' || selectedType === 'training'}
          getCertificationStatus={getEmployeeCertStatus}
          renderEmployeeExtra={(employee) => {
            if (!employee.certifications || employee.certifications.length === 0) return null;
            
            return (
              <div className="flex flex-wrap gap-1 mt-2">
                {employee.certifications.slice(0, 3).map((cert: any) => {
                  const { status } = getCertificationStatus(cert.expiryDate);
                  const colors = {
                    valid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                    expiring: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
                    expired: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
                  };
                  
                  return (
                    <span key={cert.id} className={`text-xs px-2 py-1 rounded ${colors[status]}`}>
                      {cert.area}
                    </span>
                  );
                })}
                {employee.certifications.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{employee.certifications.length - 3}</span>
                )}
              </div>
            );
          }}
        />
      ),
    });

    return baseSteps;
  }, [
    documentType,
    selectedType,
    selectedSubType,
    basicInfo,
    selectedEmployees,
    isTrainingFlow,
    employees,
    trainingDetails,
    trainingOrganizations,
    handleAddOrganization,
    toast,
  ]);

  const handleComplete = async () => {
    if (!user?.tenantId) return;

    setIsSubmitting(true);

    try {
      if (selectedType === 'training') {
        const trainingDoc: Omit<TrainingDocument, 'id' | 'createdAt' | 'updatedAt'> = {
          type: 'training',
          tenantId: user.tenantId,
          number: basicInfo.number,
          date: basicInfo.date,
          title: basicInfo.title,
          status: DocumentStatus.DRAFT,
          employeeIds: selectedEmployees,
          createdBy: user.name || 'Система',
          description: basicInfo.description,
          trainingType: (selectedSubType as 'initial' | 'periodic' | 'extraordinary') || 'periodic',
          startDate: trainingDetails.startDate,
          endDate: trainingDetails.endDate,
          organizationId: trainingDetails.organizationId,
          cost: parseFloat(trainingDetails.cost) || 0,
          program: trainingDetails.program,
        };

        addDocument(trainingDoc);
      } else {
        const orderDoc: Omit<OrderDocument, 'id' | 'createdAt' | 'updatedAt'> = {
          type: 'order',
          tenantId: user.tenantId,
          number: basicInfo.number,
          date: basicInfo.date,
          title: basicInfo.title,
          status: DocumentStatus.DRAFT,
          employeeIds: selectedEmployees,
          createdBy: user.name || 'Система',
          description: basicInfo.description,
          orderType: (selectedType as 'attestation' | 'training' | 'suspension') || 'attestation',
        };

        addDocument(orderDoc);
      }

      toast({
        title: 'Успешно',
        description: 'Документ успешно создан',
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать документ',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedType('');
    setSelectedSubType('');
    setBasicInfo({
      number: '',
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
    });
    setSelectedEmployees([]);
    setTrainingDetails({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      organizationId: '',
      cost: '0',
      program: '',
    });
  };

  return (
    <>
      <DocumentCreationWizard
        open={open}
        onOpenChange={onOpenChange}
        title="Создание приказа"
        description="Следуйте шагам для создания нового документа"
        steps={steps}
        onComplete={handleComplete}
        isSubmitting={isSubmitting}
      />
      
      <ContractorDialog
        open={contractorDialogOpen}
        onOpenChange={handleContractorDialogClose}
        contractor={null}
      />
    </>
  );
}