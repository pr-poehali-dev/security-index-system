import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import OrganizationsTab from '../components/facility-catalog/OrganizationsTab';
import FacilitiesTab from '../components/facility-catalog/FacilitiesTab';
import ComponentsTab from '../components/facility-catalog/ComponentsTab';
import ContractorsTab from '../components/facility-catalog/ContractorsTab';

export default function FacilityCatalogPage() {
  const [activeTab, setActiveTab] = useState('organizations');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
          <Icon name="Building2" size={28} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Каталог объектов</h1>
          <p className="text-muted-foreground">
            Учет опасных производственных объектов и подрядных организаций
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger 
            value="organizations" 
            className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Icon name="Building" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Организации</span>
          </TabsTrigger>
          <TabsTrigger 
            value="facilities" 
            className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Icon name="Factory" size={20} />
            <span className="text-xs font-medium text-center leading-tight">ОПО и ГТС</span>
          </TabsTrigger>
          <TabsTrigger 
            value="components" 
            className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Icon name="Cpu" size={20} />
            <span className="text-xs font-medium text-center leading-tight">ТУ и ЗС</span>
          </TabsTrigger>
          <TabsTrigger 
            value="contractors" 
            className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Icon name="Users" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Подрядчики<br/>на объектах</span>
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

        <TabsContent value="contractors">
          <ContractorsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}