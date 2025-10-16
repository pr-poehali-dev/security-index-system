import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useTrainingRequestsStore } from '@/stores/trainingRequestsStore';
import { TrainingRequest } from '@/types/attestation';
import { useToast } from '@/hooks/use-toast';

export default function TrainingRequestsTab() {
  const user = useAuthStore((state) => state.user);
  const { getRequestsByTenant, updateRequest } = useTrainingRequestsStore();
  const requests = user?.tenantId ? getRequestsByTenant(user.tenantId) : [];
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && req.priority !== priorityFilter) return false;
    return true;
  });

  const getStatusColor = (status: TrainingRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    }
  };

  const getStatusLabel = (status: TrainingRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'На рассмотрении';
      case 'approved':
        return 'Согласовано';
      case 'rejected':
        return 'Отклонено';
      case 'in_progress':
        return 'В процессе';
      case 'completed':
        return 'Завершено';
    }
  };

  const getPriorityColor = (priority: TrainingRequest['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'low':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityLabel = (priority: TrainingRequest['priority']) => {
    switch (priority) {
      case 'high':
        return 'Высокий';
      case 'medium':
        return 'Средний';
      case 'low':
        return 'Низкий';
    }
  };

  const getReasonLabel = (reason: TrainingRequest['reason']) => {
    switch (reason) {
      case 'expiring_qualification':
        return 'Истекает удостоверение';
      case 'new_position':
        return 'Новая должность';
      case 'mandatory':
        return 'Обязательное обучение';
      case 'personal_development':
        return 'Развитие';
    }
  };

  const handleApprove = (id: string) => {
    updateRequest(id, {
      status: 'approved',
      approvedBy: user?.fullName,
      approvedDate: new Date().toISOString()
    });
    toast({ title: 'Заявка согласована' });
  };

  const handleReject = (id: string) => {
    updateRequest(id, {
      status: 'rejected',
      approvedBy: user?.fullName,
      approvedDate: new Date().toISOString()
    });
    toast({ title: 'Заявка отклонена' });
  };

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Icon name="Clock" size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">На рассмотрении</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Icon name="CheckCircle2" size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-xs text-muted-foreground">Согласовано</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Icon name="Play" size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">В процессе</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Icon name="Award" size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Завершено</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Заявки на обучение</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="pending">На рассмотрении</SelectItem>
                  <SelectItem value="approved">Согласовано</SelectItem>
                  <SelectItem value="rejected">Отклонено</SelectItem>
                  <SelectItem value="in_progress">В процессе</SelectItem>
                  <SelectItem value="completed">Завершено</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все приоритеты</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="low">Низкий</SelectItem>
                </SelectContent>
              </Select>
              <Button className="gap-2">
                <Icon name="Plus" size={18} />
                Создать заявку
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="border-l-4" style={{ borderLeftColor: request.priority === 'high' ? '#ef4444' : request.priority === 'medium' ? '#f97316' : '#9ca3af' }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {request.autoCreated && (
                          <Icon name="Bot" size={16} className="text-purple-600" />
                        )}
                        <h3 className="font-semibold text-lg">{request.employeeName}</h3>
                        <Badge className={getPriorityColor(request.priority)}>
                          {getPriorityLabel(request.priority)}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusLabel(request.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Icon name="Briefcase" size={14} />
                          <span>{request.position}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Building2" size={14} />
                          <span>{request.organizationName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-muted/50 rounded-md mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="GraduationCap" size={16} className="text-primary" />
                      <span className="font-medium text-sm">{request.programName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Причина: {getReasonLabel(request.reason)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Дата заявки:</span>{' '}
                      <span className="font-medium">{new Date(request.requestDate).toLocaleDateString('ru')}</span>
                    </div>
                    {request.expiryDate && (
                      <div>
                        <span className="text-muted-foreground">Срок истечения:</span>{' '}
                        <span className="font-medium text-red-600">{new Date(request.expiryDate).toLocaleDateString('ru')}</span>
                      </div>
                    )}
                    {request.approvedBy && (
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Согласовал:</span>{' '}
                        <span className="font-medium">{request.approvedBy}</span>
                        {' '}
                        <span className="text-muted-foreground">
                          ({new Date(request.approvedDate!).toLocaleDateString('ru')})
                        </span>
                      </div>
                    )}
                  </div>

                  {request.notes && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs text-blue-700 dark:text-blue-300 mb-3">
                      <Icon name="Info" size={12} className="inline mr-1" />
                      {request.notes}
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => handleApprove(request.id)}
                      >
                        <Icon name="CheckCircle2" size={16} />
                        Согласовать
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleReject(request.id)}
                      >
                        <Icon name="XCircle" size={16} />
                        Отклонить
                      </Button>
                    </div>
                  )}

                  {request.status === 'approved' && (
                    <div className="pt-3 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => updateRequest(request.id, { status: 'in_progress' })}
                      >
                        <Icon name="Play" size={16} />
                        Начать обучение
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredRequests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Заявок не найдено</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-900">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Icon name="Bot" size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Автоматическое создание заявок
              </h4>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                Система автоматически создает заявки на обучение при истечении сроков удостоверений ПК. 
                Заявки создаются за 90 и 30 дней до истечения и помечаются иконкой робота.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="CheckCircle2" size={16} className="text-purple-600 dark:text-purple-400" />
                <span className="text-purple-700 dark:text-purple-300">
                  Активировано в настройках уведомлений
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
