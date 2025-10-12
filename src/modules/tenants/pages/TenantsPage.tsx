import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import PageHeader from '@/components/layout/PageHeader';
import { ROUTES } from '@/lib/constants';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import GeneralTab from '../components/tabs/GeneralTab';
import StatisticsTab from '../components/tabs/StatisticsTab';
import ReportsTab from '../components/tabs/ReportsTab';
import NotificationsTab from '../components/tabs/NotificationsTab';
import PlatformNewsTab from '../components/tabs/PlatformNewsTab';

export default function TenantsPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('general');

  if (!user || user.role !== 'SuperAdmin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div>
      <PageHeader
        title="Управление тенантами"
        description="Создание и администрирование организаций в системе"
        icon="Building2"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="general" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Building2" size={20} />
            <span className="text-xs font-medium">Общие</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="BarChart3" size={20} />
            <span className="text-xs font-medium">Статистика</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="FileText" size={20} />
            <span className="text-xs font-medium">Отчеты</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Bell" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Системные<br/>уведомления</span>
          </TabsTrigger>
          <TabsTrigger value="news" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Newspaper" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Новости<br/>платформы</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab />
        </TabsContent>

        <TabsContent value="statistics">
          <StatisticsTab />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="news">
          <PlatformNewsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}