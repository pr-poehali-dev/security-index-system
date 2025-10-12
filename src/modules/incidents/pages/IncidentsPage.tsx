import { memo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import IncidentsTab from '../components/IncidentsTab';
import AnalyticsTab from '../components/AnalyticsTab';
import ReportsTab from '../components/ReportsTab';
import DirectoriesTab from '../components/DirectoriesTab';
import HeatmapTab from '../components/HeatmapTab';

const IncidentsPage = memo(function IncidentsPage() {
  const user = useAuthStore((state) => state.user);

  if (!user || !user.availableModules.includes('incidents')) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div>
      <PageHeader
        title="Учет инцидентов"
        description="Фиксация и учет нарушений/отклонений от требований в области ОТ, ПБ и ЭБ"
        icon="AlertTriangle"
      />

      <Tabs defaultValue="incidents" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="incidents" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="AlertTriangle" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Инциденты и<br/>мероприятия</span>
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Flame" size={20} />
            <span className="text-xs font-medium">Тепловая карта</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="BarChart3" size={20} />
            <span className="text-xs font-medium">Аналитика</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="FileText" size={20} />
            <span className="text-xs font-medium">Отчеты</span>
          </TabsTrigger>
          <TabsTrigger value="directories" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="FolderOpen" size={20} />
            <span className="text-xs font-medium">Справочники</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incidents">
          <IncidentsTab />
        </TabsContent>

        <TabsContent value="heatmap">
          <HeatmapTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>

        <TabsContent value="directories">
          <DirectoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default IncidentsPage;