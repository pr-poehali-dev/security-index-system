import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useToast } from '@/hooks/use-toast';
import { Facility, HazardIdentification, Document } from '@/types/facilities';
import FacilityBasicInfoTab from './facility-dialog/FacilityBasicInfoTab';
import FacilityHazardIdentificationTab from './facility-dialog/FacilityHazardIdentificationTab';
import FacilityClassificationTab from './facility-dialog/FacilityClassificationTab';
import FacilityDocumentsTab from './facility-dialog/FacilityDocumentsTab';
import FacilityTerritorialAuthorityTab from './facility-dialog/FacilityTerritorialAuthorityTab';

interface FacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string | null;
}

export default function FacilityDialog({
  open,
  onOpenChange,
  facilityId,
}: FacilityDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { facilities, addFacility, updateFacility, getTerritorialAuthorities } = useFacilitiesStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  
  const [formData, setFormData] = useState<Partial<Facility>>({
    type: 'opo',
    fullName: '',
    typicalName: '',
    registrationNumber: '',
    industryCode: '',
    address: '',
    operatingOrganizationId: '',
    operatingOrganizationName: '',
    organizationId: '',
    organizationName: '',
    owner: {
      legalEntityFullName: '',
      inn: '',
      headPosition: '',
      headFullName: '',
    },
    responsiblePersonId: '',
    responsiblePersonName: '',
    hazardIdentifications: [],
    hazardClass: undefined,
    territorialAuthorityId: '',
    territorialAuthorityName: '',
    documents: [],
  });

  useEffect(() => {
    if (facilityId) {
      const facility = facilities.find((f) => f.id === facilityId);
      if (facility) {
        setFormData(facility);
      }
    } else {
      setFormData({
        type: 'opo',
        fullName: '',
        typicalName: '',
        registrationNumber: '',
        industryCode: '',
        address: '',
        operatingOrganizationId: '',
        operatingOrganizationName: '',
        organizationId: '',
        organizationName: '',
        owner: {
          legalEntityFullName: '',
          inn: '',
          headPosition: '',
          headFullName: '',
        },
        responsiblePersonId: '',
        responsiblePersonName: '',
        hazardIdentifications: [],
        hazardClass: undefined,
        territorialAuthorityId: '',
        territorialAuthorityName: '',
        documents: [],
      });
    }
    setActiveTab('basic');
  }, [facilityId, facilities, open]);

  const handleSubmit = () => {
    if (!user?.tenantId) return;
    
    if (!formData.fullName || !formData.address || !formData.organizationId) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля на вкладке "Основные сведения"',
        variant: 'destructive',
      });
      setActiveTab('basic');
      return;
    }

    const completenessCheck = {
      hasBasicInfo: !!(formData.fullName && formData.address && formData.organizationId),
      hasHazardIdentification: (formData.hazardIdentifications?.length || 0) > 0,
      hasClassification: !!formData.hazardClass,
      hasDocuments: (formData.documents?.length || 0) > 0,
      hasTerritorialAuthority: !!formData.territorialAuthorityId,
    };

    if (facilityId) {
      updateFacility(facilityId, {
        ...formData as Facility,
        completenessCheck,
      });
      toast({ title: 'Объект обновлен' });
    } else {
      addFacility({
        ...formData as Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>,
        tenantId: user.tenantId,
        completenessCheck,
      });
      toast({ title: 'Объект добавлен' });
    }
    
    onOpenChange(false);
  };

  const updateFormField = <K extends keyof Facility>(field: K, value: Facility[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {facilityId ? 'Редактирование объекта' : 'Добавление объекта'}
          </DialogTitle>
          <DialogDescription>
            {formData.type === 'opo' ? 'Опасный производственный объект' : 'Гидротехническое сооружение'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Основные</TabsTrigger>
            <TabsTrigger value="hazard">Идентификация</TabsTrigger>
            <TabsTrigger value="classification">Классификация</TabsTrigger>
            <TabsTrigger value="documents">Документы</TabsTrigger>
            <TabsTrigger value="authority">ТерОрган</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="basic" className="mt-0">
              <FacilityBasicInfoTab
                formData={formData}
                updateFormField={updateFormField}
              />
            </TabsContent>

            <TabsContent value="hazard" className="mt-0">
              <FacilityHazardIdentificationTab
                hazardIdentifications={formData.hazardIdentifications || []}
                onChange={(hazards) => updateFormField('hazardIdentifications', hazards)}
              />
            </TabsContent>

            <TabsContent value="classification" className="mt-0">
              <FacilityClassificationTab
                hazardClass={formData.hazardClass}
                onChange={(value) => updateFormField('hazardClass', value)}
              />
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <FacilityDocumentsTab
                documents={formData.documents || []}
                onChange={(docs) => updateFormField('documents', docs)}
              />
            </TabsContent>

            <TabsContent value="authority" className="mt-0">
              <FacilityTerritorialAuthorityTab
                territorialAuthorityId={formData.territorialAuthorityId}
                territorialAuthorityName={formData.territorialAuthorityName}
                authorities={getTerritorialAuthorities()}
                onChange={(id, name) => {
                  updateFormField('territorialAuthorityId', id);
                  updateFormField('territorialAuthorityName', name);
                }}
              />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            <Icon name="Check" size={16} className="mr-2" />
            {facilityId ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
