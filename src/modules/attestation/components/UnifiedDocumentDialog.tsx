import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useDocumentsStore } from '@/stores/documentsStore';
import { DocumentStatus } from '@/types/documentStatus';
import DocumentCreationWizard, { WizardStep } from '@/components/shared/DocumentCreationWizard';
import TypeSelectionStep, { TypeOption } from '@/components/shared/wizard-steps/TypeSelectionStep';
import BasicInfoStep, { BasicInfoData } from '@/components/shared/wizard-steps/BasicInfoStep';
import EmployeeSelectionStep, { Employee } from '@/components/shared/wizard-steps/EmployeeSelectionStep';
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
    value: 'initial',
    label: 'Первичное обучение',
    icon: 'BookOpen',
    color: 'text-green-600 bg-green-100 dark:bg-green-900',
    description: 'Первичное обучение для новых сотрудников',
  },
  {
    value: 'periodic',
    label: 'Периодическое обучение',
    icon: 'RefreshCw',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
    description: 'Регулярное повышение квалификации',
  },
  {
    value: 'extraordinary',
    label: 'Внеочередное обучение',
    icon: 'AlertCircle',
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900',
    description: 'Внеплановое обучение при необходимости',
  },
];

export default function UnifiedDocumentDialog({
  open,
  onOpenChange,
  documentType,
}: UnifiedDocumentDialogProps) {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { personnel, people, positions, getPersonnelByTenant, departments } = useSettingsStore();
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
  const [trainingStartDate, setTrainingStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [trainingEndDate, setTrainingEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [trainingOrganization, setTrainingOrganization] = useState('');
  const [trainingCost, setTrainingCost] = useState('0');

  const tenantPersonnel = user?.tenantId ? getPersonnelByTenant(user.tenantId) : [];

  const employees = useMemo<Employee[]>(() => {
    return tenantPersonnel.map((p) => {
      const info = getPersonnelFullInfo(p, people, positions);
      const dept = departments.find((d) => d.id === p.departmentId);

      return {
        id: p.id,
        name: info.fullName,
        position: info.position,
        department: dept?.name || '—',
      };
    });
  }, [tenantPersonnel, people, positions, departments]);

  const isTrainingFlow = documentType === 'training' || selectedType === 'training';

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
    toast,
  ]);

  const handleComplete = async () => {
    if (!user?.tenantId) return;

    setIsSubmitting(true);

    try {
      const finalType = documentType || selectedType;

      if (finalType === 'training') {
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
          startDate: trainingStartDate,
          endDate: trainingEndDate,
          organizationId: trainingOrganization || 'org-1',
          cost: parseFloat(trainingCost) || 0,
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
          orderType: (finalType as 'attestation' | 'training' | 'suspension') || 'attestation',
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
  };

  return (
    <DocumentCreationWizard
      open={open}
      onOpenChange={onOpenChange}
      title={isTrainingFlow ? 'Создание обучения' : 'Создание документа'}
      description="Следуйте шагам для создания нового документа"
      steps={steps}
      onComplete={handleComplete}
      isSubmitting={isSubmitting}
    />
  );
}
