import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import OrganizationsTab from '../components/OrganizationsTab';
import OpoTab from '../components/OpoTab';
import GtsTab from '../components/GtsTab';
import ComponentsTab from '../components/ComponentsTab';
import ContractorsTab from '../components/ContractorsTab';
import ReportsTab from '@/modules/catalog/components/tabs/ReportsTab';

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
            value="opo" 
            className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Icon name="Factory" size={20} />
            <span className="text-xs font-medium text-center leading-tight">ОПО</span>
          </TabsTrigger>
          <TabsTrigger 
            value="gts" 
            className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Icon name="Waves" size={20} />
            <span className="text-xs font-medium text-center leading-tight">ГТС</span>
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
          <TabsTrigger 
            value="reports" 
            className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Icon name="FileBarChart" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Отчеты<br/>и аналитика</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations">
          <OrganizationsTab />
        </TabsContent>

        <TabsContent value="opo">
          <OpoTab />
        </TabsContent>

        <TabsContent value="gts">
          <GtsTab />
        </TabsContent>

        <TabsContent value="components">
          <ComponentsTab />
        </TabsContent>

        <TabsContent value="contractors">
          <ContractorsTab />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}