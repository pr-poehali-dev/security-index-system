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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useToast } from '@/hooks/use-toast';
import { FacilityComponent } from '@/types/facilities';
import ComponentBasicInfoTab from './component-dialog/ComponentBasicInfoTab';
import ComponentIdentificationTab from './component-dialog/ComponentIdentificationTab';
import ComponentDocumentationTab from './component-dialog/ComponentDocumentationTab';
import ComponentExpertiseTab from './component-dialog/ComponentExpertiseTab';
import ComponentMaintenanceTab from './component-dialog/ComponentMaintenanceTab';
import ComponentConstructionTab from './component-dialog/ComponentConstructionTab';
import ComponentTechnicalParamsTab from './component-dialog/ComponentTechnicalParamsTab';
import ComponentAccidentsTab from './component-dialog/ComponentAccidentsTab';

interface ComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  componentId: string | null;
}

export default function ComponentDialog({
  open,
  onOpenChange,
  componentId,
}: ComponentDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { components, addComponent, updateComponent } = useFacilitiesStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  
  const [formData, setFormData] = useState<Partial<FacilityComponent>>({
    type: 'technical_device',
    fullName: '',
    shortName: '',
    deviceType: '',
    brand: '',
    manufacturer: '',
    manufactureDate: '',
    installationDate: '',
    commissioningDate: '',
    standardOperatingPeriod: undefined,
    technicalStatus: 'operating',
    equipmentStatus: 'working',
    registeredInRostechnadzor: false,
    internalRegistrationNumber: '',
    rostechnadzorRegistrationNumber: '',
    technologicalNumber: '',
    factoryNumber: '',
    passportNumber: '',
    passportDate: '',
    passportScanUrl: '',
    projectNumber: '',
    projectDate: '',
    projectScanUrl: '',
    customDocuments: [],
    expertiseRecords: [],
    maintenanceRecords: [],
    constructionData: [],
    technicalParameters: [],
    accidents: [],
  });

  useEffect(() => {
    if (componentId) {
      const component = components.find((c) => c.id === componentId);
      if (component) {
        setFormData(component);
      }
    } else {
      setFormData({
        type: 'technical_device',
        fullName: '',
        shortName: '',
        deviceType: '',
        brand: '',
        manufacturer: '',
        manufactureDate: '',
        installationDate: '',
        commissioningDate: '',
        standardOperatingPeriod: undefined,
        technicalStatus: 'operating',
        equipmentStatus: 'working',
        registeredInRostechnadzor: false,
        internalRegistrationNumber: '',
        rostechnadzorRegistrationNumber: '',
        technologicalNumber: '',
        factoryNumber: '',
        passportNumber: '',
        passportDate: '',
        passportScanUrl: '',
        projectNumber: '',
        projectDate: '',
        projectScanUrl: '',
        customDocuments: [],
        expertiseRecords: [],
        maintenanceRecords: [],
        constructionData: [],
        technicalParameters: [],
        accidents: [],
      });
    }
    setActiveTab('basic');
  }, [componentId, components, open]);

  const handleSubmit = () => {
    if (!user?.tenantId) return;
    
    if (!formData.fullName || !formData.facilityId) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive',
      });
      setActiveTab('basic');
      return;
    }

    if (componentId) {
      updateComponent(componentId, formData as FacilityComponent);
      toast({ title: 'Компонент обновлен' });
    } else {
      addComponent({
        ...formData as Omit<FacilityComponent, 'id' | 'createdAt' | 'updatedAt'>,
        tenantId: user.tenantId,
      });
      toast({ title: 'Компонент добавлен' });
    }
    
    onOpenChange(false);
  };

  const updateFormField = <K extends keyof FacilityComponent>(field: K, value: FacilityComponent[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {componentId ? 'Редактирование компонента' : 'Добавление компонента'}
          </DialogTitle>
          <DialogDescription>
            {formData.type === 'technical_device' ? 'Техническое устройство' : 'Здание / Сооружение'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-8 h-auto">
            <TabsTrigger value="basic" className="text-xs px-2">Основные сведения</TabsTrigger>
            <TabsTrigger value="identification" className="text-xs px-2">Идентификация</TabsTrigger>
            <TabsTrigger value="documentation" className="text-xs px-2">Документация</TabsTrigger>
            <TabsTrigger value="expertise" className="text-xs px-2">Сведения о ЭПБ</TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs px-2">Сведения о ТО</TabsTrigger>
            <TabsTrigger value="construction" className="text-xs px-2">Данные о конструкции</TabsTrigger>
            <TabsTrigger value="technical" className="text-xs px-2">Технические параметры</TabsTrigger>
            <TabsTrigger value="accidents" className="text-xs px-2">Сведения об авариях</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="basic" className="mt-0">
              <ComponentBasicInfoTab formData={formData} updateFormField={updateFormField} />
            </TabsContent>

            <TabsContent value="identification" className="mt-0">
              <ComponentIdentificationTab formData={formData} updateFormField={updateFormField} />
            </TabsContent>

            <TabsContent value="documentation" className="mt-0">
              <ComponentDocumentationTab formData={formData} updateFormField={updateFormField} />
            </TabsContent>

            <TabsContent value="expertise" className="mt-0">
              <ComponentExpertiseTab
                records={formData.expertiseRecords || []}
                onChange={(records) => updateFormField('expertiseRecords', records)}
              />
            </TabsContent>

            <TabsContent value="maintenance" className="mt-0">
              <ComponentMaintenanceTab
                records={formData.maintenanceRecords || []}
                onChange={(records) => updateFormField('maintenanceRecords', records)}
              />
            </TabsContent>

            <TabsContent value="construction" className="mt-0">
              <ComponentConstructionTab
                data={formData.constructionData || []}
                onChange={(data) => updateFormField('constructionData', data)}
              />
            </TabsContent>

            <TabsContent value="technical" className="mt-0">
              <ComponentTechnicalParamsTab
                params={formData.technicalParameters || []}
                onChange={(params) => updateFormField('technicalParameters', params)}
              />
            </TabsContent>

            <TabsContent value="accidents" className="mt-0">
              <ComponentAccidentsTab
                accidents={formData.accidents || []}
                onChange={(accidents) => updateFormField('accidents', accidents)}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            <Icon name="Check" size={16} className="mr-2" />
            {componentId ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}