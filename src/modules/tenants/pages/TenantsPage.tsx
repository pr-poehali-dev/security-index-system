import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import PageHeader from '@/components/layout/PageHeader';
import { ROUTES } from '@/lib/constants';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        <TabsList className="bg-white dark:bg-gray-800 p-1">
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="statistics">Статистика</TabsTrigger>
          <TabsTrigger value="reports">Отчеты</TabsTrigger>
          <TabsTrigger value="notifications">Системные уведомления</TabsTrigger>
          <TabsTrigger value="news">Новости платформы</TabsTrigger>
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