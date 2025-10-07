import PageHeader from '@/components/layout/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import EmployeeAttestationsTab from '../components/EmployeeAttestationsTab';
import ComplianceAnalysisTab from '../components/ComplianceAnalysisTab';
import OrdersTrainingTab from '../components/OrdersTrainingTab';
import ReportsTab from '../components/ReportsTab';
import DirectoriesTab from '../components/DirectoriesTab';
import NotificationsTab from '../components/NotificationsTab';
import AttestationCalendarTab from '../components/AttestationCalendarTab';

export default function AttestationPage() {
  return (
    <div>
      <PageHeader
        title="Аттестация персонала"
        description="Управление аттестациями, допусками и обучением сотрудников"
        icon="GraduationCap"
      />

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees" className="gap-2">
            <Icon name="Users" size={16} />
            Сотрудники и аттестации
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Icon name="CalendarDays" size={16} />
            Календарь-планировщик
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            <Icon name="Target" size={16} />
            Анализ соответствия
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <Icon name="FileText" size={16} />
            Приказы и обучения
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <Icon name="BarChart3" size={16} />
            Отчеты
          </TabsTrigger>
          <TabsTrigger value="directories" className="gap-2">
            <Icon name="BookOpen" size={16} />
            Справочники
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Icon name="Bell" size={16} />
            Уведомления
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <EmployeeAttestationsTab />
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
}