// src/modules/training-center/pages/TrainingCenterPage.tsx
// Описание: Страница учебного центра - программы, группы, сертификаты и записи
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import ProgramsTab from '../components/tabs/ProgramsTab';
import RequestsTab from '../components/tabs/RequestsTab';
import EnrollmentsTab from '../components/tabs/EnrollmentsTab';
import ScheduleTab from '../components/tabs/ScheduleTab';
import DirectoriesTab from '../components/tabs/DirectoriesTab';
import ReportsTab from '../components/tabs/ReportsTab';
import IssuedCertificatesRegistry from '../components/certificates/IssuedCertificatesRegistry';

export default function TrainingCenterPage() {
  const [activeTab, setActiveTab] = useState('programs');

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Учебный центр</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Управление учебными программами и заявками на обучение
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-1 md:gap-2 bg-transparent p-0">
          <TabsTrigger value="programs" className="flex-col gap-1 md:gap-2 h-16 md:h-20 px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="BookOpen" size={18} />
            <span className="text-[10px] md:text-xs font-medium text-center leading-tight">Курсы<br/>подготовки</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-col gap-1 md:gap-2 h-16 md:h-20 px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="FileText" size={18} />
            <span className="text-[10px] md:text-xs font-medium text-center leading-tight">Заявки<br/>организаций</span>
          </TabsTrigger>
          <TabsTrigger value="enrollments" className="flex-col gap-1 md:gap-2 h-16 md:h-20 px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="UserCheck" size={18} />
            <span className="text-[10px] md:text-xs font-medium">Обучающиеся</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex-col gap-1 md:gap-2 h-16 md:h-20 px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Calendar" size={18} />
            <span className="text-[10px] md:text-xs font-medium">Расписание</span>
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex-col gap-1 md:gap-2 h-16 md:h-20 px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Award" size={18} />
            <span className="text-[10px] md:text-xs font-medium text-center leading-tight">Реестр<br/>удостоверений</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-col gap-1 md:gap-2 h-16 md:h-20 px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="BarChart3" size={18} />
            <span className="text-[10px] md:text-xs font-medium">Отчёты</span>
          </TabsTrigger>
          <TabsTrigger value="directories" className="flex-col gap-1 md:gap-2 h-16 md:h-20 px-3 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="FolderOpen" size={18} />
            <span className="text-[10px] md:text-xs font-medium">Справочники</span>
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