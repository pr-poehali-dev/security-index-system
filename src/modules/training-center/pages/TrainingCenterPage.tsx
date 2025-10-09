import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgramsTab from '../components/ProgramsTab';
import GroupsTab from '../components/GroupsTab';
import EnrollmentsTab from '../components/EnrollmentsTab';
import ScheduleTab from '../components/ScheduleTab';
import DirectoriesTab from '../components/DirectoriesTab';
import ReportsTab from '../components/ReportsTab';

export default function TrainingCenterPage() {
  const [activeTab, setActiveTab] = useState('programs');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Учебный центр</h1>
        <p className="text-muted-foreground mt-1">
          Управление учебными программами, группами и обучающимися
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="programs">Программы</TabsTrigger>
          <TabsTrigger value="groups">Группы</TabsTrigger>
          <TabsTrigger value="enrollments">Обучающиеся</TabsTrigger>
          <TabsTrigger value="schedule">Расписание</TabsTrigger>
          <TabsTrigger value="reports">Отчёты</TabsTrigger>
          <TabsTrigger value="directories">Справочники</TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <ProgramsTab />
        </TabsContent>

        <TabsContent value="groups">
          <GroupsTab />
        </TabsContent>

        <TabsContent value="enrollments">
          <EnrollmentsTab />
        </TabsContent>

        <TabsContent value="schedule">
          <ScheduleTab />
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
