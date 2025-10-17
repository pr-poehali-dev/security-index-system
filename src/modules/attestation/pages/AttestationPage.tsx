// src/modules/attestation/pages/AttestationPage.tsx
// Описание: Страница модуля аттестации - сотрудники, сертификаты, приказы и отчеты
import { memo } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import EmployeeAttestationsTab from '../components/employees/EmployeeAttestationsTab';
import ComplianceAnalysisTab from '../components/tabs/ComplianceAnalysisTab';
import ReportsTab from '../components/tabs/ReportsTab';
import AttestationCalendarTab from '../components/tabs/AttestationCalendarTab';
import TrainingRequestsTab from '../components/tabs/TrainingRequestsTab';
import TrainingTab from '../components/tabs/TrainingTab';
import AttestationOrdersTab from '../components/tabs/AttestationOrdersTab';
import SettingsTab from '../components/tabs/SettingsTab';

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
          <TabsTrigger value="compliance" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Target" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Анализ<br/>соответствия</span>
          </TabsTrigger>
          <TabsTrigger value="training-requests" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="FileCheck" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Заявки на<br/>обучение</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="GraduationCap" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Заявки на<br/>тренинг</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="FileText" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Приказы на<br/>аттестацию</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="CalendarDays" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Календарь-<br/>планировщик</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="BarChart3" size={20} />
            <span className="text-xs font-medium">Отчеты</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Settings" size={20} />
            <span className="text-xs font-medium">Настройки</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <EmployeeAttestationsTab />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceAnalysisTab />
        </TabsContent>

        <TabsContent value="training-requests">
          <TrainingRequestsTab />
        </TabsContent>

        <TabsContent value="training">
          <TrainingTab />
        </TabsContent>

        <TabsContent value="orders">
          <AttestationOrdersTab />
        </TabsContent>

        <TabsContent value="calendar">
          <AttestationCalendarTab />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default AttestationPage;