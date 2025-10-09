import { useAuthStore } from '@/stores/authStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import IncidentsTab from '../components/IncidentsTab';
import DirectoriesTab from '../components/DirectoriesTab';

export default function IncidentsPage() {
  const user = useAuthStore((state) => state.user);

  if (!user || !user.availableModules.includes('incidents')) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Учет инцидентов</h1>
          <p className="text-muted-foreground mt-2">
            Фиксация и учет нарушений/отклонений от требований в области ОТ, ПБ и ЭБ
          </p>
        </div>
      </div>

      <Tabs defaultValue="incidents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="incidents" className="gap-2">
            <Icon name="AlertTriangle" size={16} />
            Инциденты и мероприятия
          </TabsTrigger>
          <TabsTrigger value="directories" className="gap-2">
            <Icon name="FolderOpen" size={16} />
            Справочники
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incidents">
          <IncidentsTab />
        </TabsContent>

        <TabsContent value="directories">
          <DirectoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}