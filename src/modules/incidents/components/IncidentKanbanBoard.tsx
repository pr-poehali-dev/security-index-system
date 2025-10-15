import { useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon, { type IconName } from '@/components/ui/icon';
import type { Incident, IncidentStatus } from '@/types';
import { getPersonnelFullInfo } from '@/lib/utils/personnelUtils';
import IncidentDetailsDialog from './IncidentDetailsDialog';

interface KanbanColumn {
  id: IncidentStatus;
  title: string;
  color: string;
  icon: IconName;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'created', title: 'Создано', color: 'bg-blue-100 dark:bg-blue-900/20', icon: 'Plus' },
  { id: 'in_progress', title: 'В работе', color: 'bg-purple-100 dark:bg-purple-900/20', icon: 'PlayCircle' },
  { id: 'awaiting', title: 'Ожидает', color: 'bg-yellow-100 dark:bg-yellow-900/20', icon: 'Clock' },
  { id: 'overdue', title: 'Просрочено', color: 'bg-red-100 dark:bg-red-900/20', icon: 'AlertCircle' },
  { id: 'completed', title: 'Исполнено', color: 'bg-emerald-100 dark:bg-emerald-900/20', icon: 'CheckCircle2' },
  { id: 'completed_late', title: 'Исполнено с опозданием', color: 'bg-orange-100 dark:bg-orange-900/20', icon: 'Clock' },
];

interface IncidentKanbanBoardProps {
  searchTerm?: string;
  directionFilter?: string;
  organizationFilter?: string;
  siteFilter?: string;
}

export default function IncidentKanbanBoard({ 
  searchTerm = '', 
  directionFilter = 'all',
  organizationFilter = 'all',
  siteFilter = 'all'
}: IncidentKanbanBoardProps) {
  const user = useAuthStore((state) => state.user);
  const allIncidents = useIncidentsStore((state) => state.incidents);
  const updateIncident = useIncidentsStore((state) => state.updateIncident);
  const directions = useIncidentsStore((state) => state.directions);
  const { organizations, productionSites, personnel, people, positions } = useSettingsStore();

  const incidents = useMemo(() => 
    user?.tenantId ? allIncidents.filter(inc => inc.tenantId === user.tenantId) : []
  , [allIncidents, user?.tenantId]);
  
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const matchesSearch = inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inc.correctiveAction.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDirection = directionFilter === 'all' || inc.directionId === directionFilter;
      const matchesOrganization = organizationFilter === 'all' || inc.organizationId === organizationFilter;
      const matchesSite = siteFilter === 'all' || inc.productionSiteId === siteFilter;
      
      return matchesSearch && matchesDirection && matchesOrganization && matchesSite;
    });
  }, [incidents, searchTerm, directionFilter, organizationFilter, siteFilter]);

  const incidentsByStatus = useMemo(() => {
    const grouped: Record<IncidentStatus, Incident[]> = {
      created: [],
      in_progress: [],
      awaiting: [],
      overdue: [],
      completed: [],
      completed_late: []
    };

    filteredIncidents.forEach(incident => {
      grouped[incident.status].push(incident);
    });

    return grouped;
  }, [filteredIncidents]);

  const getOrganizationName = (orgId: string) => {
    return organizations.find(o => o.id === orgId)?.name || '—';
  };

  const getProductionSiteName = (siteId: string) => {
    return productionSites.find(s => s.id === siteId)?.name || '—';
  };

  const getDirectionName = (directionId: string) => {
    return directions.find(d => d.id === directionId)?.name || '—';
  };

  const getResponsibleName = (personnelId: string) => {
    const pers = personnel.find(p => p.id === personnelId);
    if (!pers) return '—';
    const info = getPersonnelFullInfo(pers, people, positions);
    return info.fullName;
  };

  const getDaysLeftBadge = (daysLeft: number) => {
    if (daysLeft < 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          Просрочено на {Math.abs(daysLeft)} дн.
        </Badge>
      );
    }
    if (daysLeft === 0) {
      return <Badge variant="outline" className="text-xs">Сегодня</Badge>;
    }
    if (daysLeft <= 3) {
      return <Badge variant="default" className="text-xs bg-orange-500">Осталось {daysLeft} дн.</Badge>;
    }
    return <Badge variant="secondary" className="text-xs">Осталось {daysLeft} дн.</Badge>;
  };

  const handleDragStart = (e: React.DragEvent, incident: Incident) => {
    e.dataTransfer.setData('incidentId', incident.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: IncidentStatus) => {
    e.preventDefault();
    const incidentId = e.dataTransfer.getData('incidentId');
    const incident = incidents.find(inc => inc.id === incidentId);
    
    if (incident && incident.status !== targetStatus) {
      updateIncident(incidentId, { status: targetStatus });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KANBAN_COLUMNS.map((column) => (
          <div
            key={column.id}
            className="flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <Card className={`${column.color} border-2`}>
              <CardHeader className="p-4 pb-3">
                <div className="flex items-center gap-2">
                  <Icon name={column.icon} size={16} />
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <Badge variant="outline" className="ml-auto">
                    {incidentsByStatus[column.id].length}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            <ScrollArea className="flex-1 mt-2" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              <div className="space-y-2 pr-4">
                {incidentsByStatus[column.id].length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Пусто
                  </div>
                ) : (
                  incidentsByStatus[column.id].map((incident) => (
                    <Card
                      key={incident.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, incident)}
                      onClick={() => setSelectedIncident(incident)}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-primary"
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium line-clamp-2 flex-1">
                            {incident.description}
                          </p>
                          {getDaysLeftBadge(incident.daysLeft)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Icon name="Building" size={12} />
                            <span className="truncate">{getOrganizationName(incident.organizationId)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Icon name="MapPin" size={12} />
                            <span className="truncate">{getProductionSiteName(incident.productionSiteId)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Icon name="User" size={12} />
                            <span className="truncate">{getResponsibleName(incident.responsiblePersonnelId)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t">
                          <span className="text-muted-foreground truncate">
                            {getDirectionName(incident.directionId)}
                          </span>
                          <span className="text-muted-foreground whitespace-nowrap ml-2">
                            {new Date(incident.plannedDate).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>

      {selectedIncident && (
        <IncidentDetailsDialog
          incident={selectedIncident}
          open={!!selectedIncident}
          onOpenChange={(open) => !open && setSelectedIncident(null)}
        />
      )}
    </>
  );
}