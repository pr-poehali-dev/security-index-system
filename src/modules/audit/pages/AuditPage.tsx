// src/modules/audit/pages/AuditPage.tsx
// Модуль аудита промышленной безопасности с табами для планирования, мониторинга и анализа аудитов

import { memo, useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import PageHeader from '@/components/layout/PageHeader';
import DashboardTab from '../components/tabs/DashboardTab';
import PlanningTab from '../components/tabs/PlanningTab';
import ActiveAuditsTab from '../components/tabs/ActiveAuditsTab';
import CompletedAuditsTab from '../components/tabs/CompletedAuditsTab';
import ViolationsTab from '../components/tabs/ViolationsTab';

const AuditPage = memo(function AuditPage() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (!user || !user.availableModules.includes('audit')) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Аудит ПБ"
          description="Планирование и проведение аудитов промышленной безопасности"
          icon="ClipboardCheck"
        />
        <Skeleton className="h-12 rounded-lg mb-6 max-w-2xl" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Аудит ПБ"
        description="Планирование и проведение аудитов промышленной безопасности"
        icon="ClipboardCheck"
      />

      <Tabs defaultValue="dashboard" className="space-y-4 md:space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-1 md:gap-2 bg-transparent p-0">
          <TabsTrigger value="dashboard" className="flex-col gap-1 md:gap-2 h-16 md:h-20 px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="LayoutDashboard" size={18} />
            <span className="text-[10px] md:text-xs font-medium text-center leading-tight">Дашборд<br/>Аудита</span>
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex-col gap-1 md:gap-2 h-16 md:h-20 px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Calendar" size={18} />
            <span className="text-[10px] md:text-xs font-medium text-center leading-tight">Планирование<br/>Аудита</span>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-col gap-1 md:gap-2 h-16 md:h-20 px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Play" size={18} />
            <span className="text-[10px] md:text-xs font-medium text-center leading-tight">Активные<br/>Аудиты</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-col gap-1 md:gap-2 h-16 md:h-20 px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="CheckCircle2" size={18} />
            <span className="text-[10px] md:text-xs font-medium text-center leading-tight">Завершенные<br/>Аудиты</span>
          </TabsTrigger>
          <TabsTrigger value="violations" className="flex-col gap-1 md:gap-2 h-16 md:h-20 px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="AlertCircle" size={18} />
            <span className="text-[10px] md:text-xs font-medium text-center leading-tight">Выявленные<br/>нарушения</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="planning">
          <PlanningTab />
        </TabsContent>

        <TabsContent value="active">
          <ActiveAuditsTab />
        </TabsContent>

        <TabsContent value="completed">
          <CompletedAuditsTab />
        </TabsContent>

        <TabsContent value="violations">
          <ViolationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default AuditPage;
