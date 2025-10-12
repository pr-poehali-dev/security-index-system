// src/modules/attestation/pages/AttestationPage.tsx
import { memo } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import EmployeeAttestationsTab from '../components/employees/EmployeeAttestationsTab';
import ComplianceAnalysisTab from '../components/tabs/ComplianceAnalysisTab';
import OrdersTrainingTab from '../components/tabs/OrdersTrainingTab';
import ReportsTab from '../components/tabs/ReportsTab';
import DirectoriesTab from '../components/tabs/DirectoriesTab';
import NotificationsTab from '../components/tabs/NotificationsTab';
import AttestationCalendarTab from '../components/tabs/AttestationCalendarTab';
import TasksTab from '../components/tabs/TasksTab';

const AttestationPage = memo(function AttestationPage() {
  return (
    <div>
      <PageHeader
        title="Аттестация персонала"
        description="Управление аттестациями, допусками и обучением сотрудников"
        icon="GraduationCap"
      />

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="employees" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Users" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Сотрудники и<br/>аттестации</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="ListTodo" size={20} />
            <span className="text-xs font-medium">Задачи</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="CalendarDays" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Календарь-<br/>планировщик</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Target" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Анализ<br/>соответствия</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="FileText" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Приказы и<br/>обучения</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="BarChart3" size={20} />
            <span className="text-xs font-medium">Отчеты</span>
          </TabsTrigger>
          <TabsTrigger value="directories" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="BookOpen" size={20} />
            <span className="text-xs font-medium">Справочники</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Bell" size={20} />
            <span className="text-xs font-medium">Уведомления</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <EmployeeAttestationsTab />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksTab />
        </TabsContent>

        <TabsContent value="calendar">
          <AttestationCalendarTab />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceAnalysisTab />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersTrainingTab />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>

        <TabsContent value="directories">
          <DirectoriesTab />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default AttestationPage;