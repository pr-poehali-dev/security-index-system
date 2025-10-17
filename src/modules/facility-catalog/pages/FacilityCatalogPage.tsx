import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import OpoTab from '../components/OpoTab';
import GtsTab from '../components/GtsTab';
import ComponentsTab from '../components/ComponentsTab';
import ContractorsTab from '../components/ContractorsTab';
import ReportsTab from '../components/tabs/ReportsTab';
import OpoCharacteristicsTab from '../components/OpoCharacteristicsTab';

export default function FacilityCatalogPage() {
  const [activeTab, setActiveTab] = useState('opo');

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
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
          <TabsTrigger 
            value="opo" 
            className="flex-col gap-1.5 h-20 px-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'opo' ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              <Icon name="TriangleAlert" size={18} className={activeTab === 'opo' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
            </div>
            <span className="text-xs font-medium text-center leading-tight">ОПО</span>
          </TabsTrigger>
          <TabsTrigger 
            value="gts" 
            className="flex-col gap-1.5 h-20 px-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'gts' ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              <Icon name="Waves" size={18} className={activeTab === 'gts' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
            </div>
            <span className="text-xs font-medium text-center leading-tight">ГТС</span>
          </TabsTrigger>
          <TabsTrigger 
            value="components" 
            className="flex-col gap-1.5 h-20 px-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'components' ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              <Icon name="Wrench" size={18} className={activeTab === 'components' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
            </div>
            <span className="text-xs font-medium text-center leading-tight">ТУ и ЗС</span>
          </TabsTrigger>
          <TabsTrigger 
            value="contractors" 
            className="flex-col gap-1.5 h-20 px-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'contractors' ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              <Icon name="Users" size={18} className={activeTab === 'contractors' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
            </div>
            <span className="text-xs font-medium text-center leading-tight">Подрядчики<br/>на объектах</span>
          </TabsTrigger>
          <TabsTrigger 
            value="characteristics" 
            className="flex-col gap-1.5 h-20 px-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'characteristics' ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              <Icon name="ClipboardList" size={18} className={activeTab === 'characteristics' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
            </div>
            <span className="text-xs font-medium text-center leading-tight">Сведения<br/>характеризующие ОПО</span>
          </TabsTrigger>
          <TabsTrigger 
            value="reports" 
            className="flex-col gap-1.5 h-20 px-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'reports' ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              <Icon name="FileText" size={18} className={activeTab === 'reports' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'} />
            </div>
            <span className="text-xs font-medium text-center leading-tight">Отчеты<br/>и аналитика</span>
          </TabsTrigger>
        </TabsList>

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

        <TabsContent value="characteristics">
          <OpoCharacteristicsTab />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}