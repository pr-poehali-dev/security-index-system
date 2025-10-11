import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useIncidentsStore } from '@/stores/incidentsStore';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import type { Audit, Incident } from '@/types';

interface AuditCardProps {
  audit: Audit;
  checklistName?: string;
  checklistCriticalCount?: number;
  onConduct: (audit: Audit) => void;
}

const getStatusColor = (status: Audit['status']) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-700';
    case 'in_progress': return 'bg-purple-100 text-purple-700';
    case 'completed': return 'bg-green-100 text-green-700';
  }
};

const getStatusLabel = (status: Audit['status']) => {
  switch (status) {
    case 'scheduled': return 'Запланирован';
    case 'in_progress': return 'В процессе';
    case 'completed': return 'Завершен';
  }
};

const getPassRate = (audit: Audit) => {
  if (audit.findings.length === 0) return 0;
  const passed = audit.findings.filter(f => f.result === 'pass').length;
  return Math.round((passed / audit.findings.length) * 100);
};

export default function AuditCard({ audit, checklistName, checklistCriticalCount = 0, onConduct }: AuditCardProps) {
  const { incidents, directions, sources } = useIncidentsStore();
  const navigate = useNavigate();
  const [showIncidentsDialog, setShowIncidentsDialog] = useState(false);
  const passRate = getPassRate(audit);
  
  const criticalFailures = audit.findings.filter(f => f.result === 'fail').length;
  const relatedIncidents = incidents.filter(inc => inc.sourceAuditId === audit.id);
  const hasCreatedIncidents = relatedIncidents.length > 0;

  const getIncidentStatusColor = (status: Incident['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'awaiting': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getIncidentStatusLabel = (status: Incident['status']) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'completed_late': return 'Завершен с опозданием';
      case 'in_progress': return 'В работе';
      case 'overdue': return 'Просрочен';
      case 'awaiting': return 'Ожидает';
      default: return 'Создан';
    }
  };

  const handleViewIncidents = () => {
    setShowIncidentsDialog(true);
  };

  const handleGoToIncident = (incidentId: string) => {
    navigate(`/incidents?id=${incidentId}`);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{checklistName}</h3>
              <Badge className={getStatusColor(audit.status)}>
                {getStatusLabel(audit.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Icon name="Calendar" size={14} />
                <span>Запланирован: {new Date(audit.scheduledDate).toLocaleDateString('ru-RU')}</span>
              </div>
              {audit.completedDate && (
                <div className="flex items-center gap-1">
                  <Icon name="CheckCircle2" size={14} className="text-green-600" />
                  <span>Завершен: {new Date(audit.completedDate).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
            </div>
          </div>
          {audit.status === 'completed' && (
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">{passRate}%</div>
              <p className="text-xs text-gray-600">соответствие</p>
            </div>
          )}
        </div>

        {audit.findings.length > 0 && (
          <div className="mb-4 space-y-3">
            <h4 className="text-sm font-medium">Результаты проверки:</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="p-2 bg-green-50 rounded text-center">
                <Icon name="CheckCircle2" className="mx-auto mb-1 text-green-600" size={20} />
                <p className="text-xs text-gray-600">Соответствует</p>
                <p className="font-bold text-green-700">
                  {audit.findings.filter(f => f.result === 'pass').length}
                </p>
              </div>
              <div className="p-2 bg-red-50 rounded text-center">
                <Icon name="XCircle" className="mx-auto mb-1 text-red-600" size={20} />
                <p className="text-xs text-gray-600">Не соответствует</p>
                <p className="font-bold text-red-700">
                  {audit.findings.filter(f => f.result === 'fail').length}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <Icon name="Minus" className="mx-auto mb-1 text-gray-600" size={20} />
                <p className="text-xs text-gray-600">Не применимо</p>
                <p className="font-bold text-gray-700">
                  {audit.findings.filter(f => f.result === 'n/a').length}
                </p>
              </div>
            </div>
            
            {hasCreatedIncidents && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Icon name="AlertTriangle" className="text-orange-600" size={18} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-900">
                      Создано инцидентов: {relatedIncidents.length}
                    </p>
                    <p className="text-xs text-orange-700">
                      По критическим замечаниям автоматически созданы инциденты и задачи
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleViewIncidents}
                    className="gap-2 border-orange-300 hover:bg-orange-100"
                  >
                    <Icon name="Eye" size={14} />
                    Просмотр
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Icon name="Eye" className="mr-2" size={14} />
            Подробнее
          </Button>
          {audit.status === 'scheduled' && (
            <Button size="sm" variant="secondary" onClick={() => onConduct(audit)}>
              <Icon name="Play" className="mr-2" size={14} />
              Начать проверку
            </Button>
          )}
          {audit.status === 'in_progress' && (
            <Button size="sm" onClick={() => onConduct(audit)}>
              <Icon name="Save" className="mr-2" size={14} />
              Продолжить
            </Button>
          )}
        </div>
      </CardContent>

      <Dialog open={showIncidentsDialog} onOpenChange={setShowIncidentsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Инциденты из аудита</DialogTitle>
            <DialogDescription>
              Автоматически созданные инциденты и задачи по результатам проверки
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {relatedIncidents.map((incident) => {
              const direction = directions.find(d => d.id === incident.directionId);
              const source = sources.find(s => s.id === incident.sourceId);

              return (
                <Card key={incident.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getIncidentStatusColor(incident.status)}>
                              {getIncidentStatusLabel(incident.status)}
                            </Badge>
                            {incident.daysLeft < 0 && (
                              <Badge variant="destructive" className="gap-1">
                                <Icon name="AlertTriangle" size={12} />
                                Просрочен на {Math.abs(incident.daysLeft)} дн.
                              </Badge>
                            )}
                            {incident.daysLeft > 0 && incident.daysLeft <= 3 && (
                              <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700">
                                <Icon name="Clock" size={12} />
                                Осталось {incident.daysLeft} дн.
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-semibold mb-1">{incident.description}</h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Направление</p>
                          <p className="font-medium">{direction?.name || 'Не указано'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Источник</p>
                          <p className="font-medium">{source?.name || 'Не указано'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Дата сообщения</p>
                          <p className="font-medium">{new Date(incident.reportDate).toLocaleDateString('ru-RU')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-xs mb-1">Плановый срок</p>
                          <p className="font-medium">{new Date(incident.plannedDate).toLocaleDateString('ru-RU')}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Корректирующие действия:</p>
                        <p className="text-sm">{incident.correctiveAction}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGoToIncident(incident.id)}
                          className="gap-2"
                        >
                          <Icon name="ExternalLink" size={14} />
                          Открыть инцидент
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Всего инцидентов: {relatedIncidents.length}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowIncidentsDialog(false)}>
                Закрыть
              </Button>
              <Button onClick={() => navigate('/incidents')} className="gap-2">
                <Icon name="List" size={16} />
                Все инциденты
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}