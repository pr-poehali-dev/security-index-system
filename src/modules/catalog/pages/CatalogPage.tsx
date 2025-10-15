// src/modules/catalog/pages/CatalogPage.tsx
// Описание: Страница каталога - объекты и подрядчики
import { memo } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import ObjectsTab from '../components/tabs/ObjectsTab';
import ContractorsTab from '../components/tabs/ContractorsTab';
import ReportsTab from '../components/tabs/ReportsTab';

const CatalogPage = memo(function CatalogPage() {
  return (
    <div>
      <PageHeader
        title="Каталог объектов"
        description="Учет опасных производственных объектов и подрядных организаций"
        icon="Building"
      />

      <Tabs defaultValue="objects" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="objects" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Building" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Объекты<br/>и оборудование</span>
          </TabsTrigger>
          <TabsTrigger value="contractors" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Users" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Подрядчики<br/>на объектах</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="FileBarChart" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Отчеты<br/>и аналитика</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="objects">
          <ObjectsTab />
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
});

export default CatalogPage;