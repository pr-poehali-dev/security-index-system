import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import OrganizationsTab from '../components/facility-catalog/OrganizationsTab';
import FacilitiesTab from '../components/facility-catalog/FacilitiesTab';
import ComponentsTab from '../components/facility-catalog/ComponentsTab';

export default function FacilityCatalogPage() {
  const [activeTab, setActiveTab] = useState('organizations');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Icon name="Building2" size={24} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Каталог объектов</h1>
          <p className="text-muted-foreground">
            Управление организациями, ОПО, гидротехническими сооружениями и их составом
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Icon name="Building" size={16} />
            Организации
          </TabsTrigger>
          <TabsTrigger value="facilities" className="flex items-center gap-2">
            <Icon name="Factory" size={16} />
            ОПО и ГТС
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Icon name="Cpu" size={16} />
            ТУ и ЗС
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations">
          <OrganizationsTab />
        </TabsContent>

        <TabsContent value="facilities">
          <FacilitiesTab />
        </TabsContent>

        <TabsContent value="components">
          <ComponentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}