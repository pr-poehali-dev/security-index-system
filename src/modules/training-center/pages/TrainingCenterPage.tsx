import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import ProgramsTab from '../components/ProgramsTab';
import RequestsTab from '../components/RequestsTab';
import EnrollmentsTab from '../components/EnrollmentsTab';
import ScheduleTab from '../components/ScheduleTab';
import DirectoriesTab from '../components/DirectoriesTab';
import ReportsTab from '../components/ReportsTab';
import IssuedCertificatesRegistry from '../components/IssuedCertificatesRegistry';

export default function TrainingCenterPage() {
  const [activeTab, setActiveTab] = useState('programs');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Учебный центр</h1>
        <p className="text-muted-foreground mt-2">
          Управление учебными программами и заявками на обучение
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="programs" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="BookOpen" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Курсы<br/>подготовки</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="FileText" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Заявки<br/>организаций</span>
          </TabsTrigger>
          <TabsTrigger value="enrollments" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="UserCheck" size={20} />
            <span className="text-xs font-medium">Обучающиеся</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Calendar" size={20} />
            <span className="text-xs font-medium">Расписание</span>
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Award" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Реестр<br/>удостоверений</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="BarChart3" size={20} />
            <span className="text-xs font-medium">Отчёты</span>
          </TabsTrigger>
          <TabsTrigger value="directories" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="FolderOpen" size={20} />
            <span className="text-xs font-medium">Справочники</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <ProgramsTab />
        </TabsContent>

        <TabsContent value="requests">
          <RequestsTab />
        </TabsContent>

        <TabsContent value="enrollments">
          <EnrollmentsTab />
        </TabsContent>

        <TabsContent value="schedule">
          <ScheduleTab />
        </TabsContent>

        <TabsContent value="certificates">
          <IssuedCertificatesRegistry />
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
}