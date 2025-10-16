import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useAuthStore } from '@/stores/authStore';
import { useQualificationRenewalStore } from '@/stores/qualificationRenewalStore';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function QualificationRenewalTab() {
  const user = useAuthStore((state) => state.user);
  const { getRenewalsByTenant, updateRenewal } = useQualificationRenewalStore();
  const renewals = user?.tenantId ? getRenewalsByTenant(user.tenantId) : [];
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRenewals = renewals.filter((renewal) => 
    statusFilter === 'all' || renewal.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает завершения';
      case 'completed':
        return 'Завершено';
      case 'failed':
        return 'Ошибка';
      default:
        return status;
    }
  };

  const handleComplete = (id: string) => {
    updateRenewal(id, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
    toast({ 
      title: 'Удостоверение продлено', 
      description: 'Новое удостоверение ПК успешно создано и добавлено в профиль сотрудника' 
    });
  };

  const stats = {
    total: renewals.length,
    pending: renewals.filter(r => r.status === 'pending').length,
    completed: renewals.filter(r => r.status === 'completed').length,
    thisMonth: renewals.filter(r => {
      const created = new Date(r.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Icon name="FileCheck2" size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Всего продлений</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Icon name="Clock" size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">В ожидании</p>
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
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Завершено</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Icon name="TrendingUp" size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
                <p className="text-xs text-muted-foreground">В этом месяце</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>Автоматическое продление удостоверений ПК</CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="pending">Ожидает</SelectItem>
                  <SelectItem value="completed">Завершено</SelectItem>
                  <SelectItem value="failed">Ошибка</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Icon name="Download" size={16} />
                Экспорт
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRenewals.map((renewal) => (
              <Card key={renewal.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {renewal.autoCreated && (
                          <Icon name="Bot" size={16} className="text-purple-600" />
                        )}
                        <h3 className="font-semibold text-lg">{renewal.employeeName}</h3>
                        <Badge className={getStatusColor(renewal.status)}>
                          {getStatusLabel(renewal.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        <Icon name="GraduationCap" size={14} className="inline mr-1" />
                        {renewal.trainingProgramName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {renewal.oldCertificationId && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-md">
                        <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                          <Icon name="FileX" size={14} />
                          Старое удостоверение
                        </h4>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-muted-foreground">Срок истечения:</span>{' '}
                            <span className="font-medium text-red-600">
                              {renewal.oldExpiryDate && new Date(renewal.oldExpiryDate).toLocaleDateString('ru')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                      <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                        <Icon name="FileCheck2" size={14} />
                        Новое удостоверение
                      </h4>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-muted-foreground">Номер:</span>{' '}
                          <span className="font-medium">{renewal.newCertificateNumber}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Дата выдачи:</span>{' '}
                          <span className="font-medium">
                            {new Date(renewal.newIssueDate).toLocaleDateString('ru')}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Действительно до:</span>{' '}
                          <span className="font-medium text-green-600">
                            {new Date(renewal.newExpiryDate).toLocaleDateString('ru')}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Срок действия:</span>{' '}
                          <span className="font-medium">{renewal.validityPeriod} лет</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {renewal.notes && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs text-blue-700 dark:text-blue-300 mb-3">
                      <Icon name="Info" size={12} className="inline mr-1" />
                      {renewal.notes}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mb-3">
                    Создано: {new Date(renewal.createdAt).toLocaleDateString('ru')} в{' '}
                    {new Date(renewal.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                    {renewal.completedAt && (
                      <>
                        {' • '}
                        Завершено: {new Date(renewal.completedAt).toLocaleDateString('ru')} в{' '}
                        {new Date(renewal.completedAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                      </>
                    )}
                  </div>

                  {renewal.status === 'pending' && (
                    <div className="pt-3 border-t">
                      <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => handleComplete(renewal.id)}
                      >
                        <Icon name="CheckCircle2" size={16} />
                        Завершить продление
                      </Button>
                    </div>
                  )}

                  {renewal.status === 'completed' && (
                    <div className="pt-3 border-t flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Icon name="CheckCircle2" size={16} />
                      <span className="font-medium">Удостоверение успешно продлено и добавлено в профиль сотрудника</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredRenewals.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Продлений не найдено</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-200 dark:border-purple-900">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Icon name="Sparkles" size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Как работает автоматическое продление
              </h4>
              <div className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                <p>
                  <strong>1. Обучение завершено</strong> → Система получает информацию о прохождении курса повышения квалификации
                </p>
                <p>
                  <strong>2. Генерация удостоверения</strong> → Автоматически создается новое удостоверение ПК с уникальным номером
                </p>
                <p>
                  <strong>3. Расчет сроков</strong> → Система рассчитывает новую дату истечения (обычно +5 лет от даты выдачи)
                </p>
                <p>
                  <strong>4. Обновление профиля</strong> → Новое удостоверение добавляется в карточку сотрудника, старое помечается как истекшее
                </p>
                <p>
                  <strong>5. Уведомления</strong> → Сотрудник и кадровая служба получают уведомления о продлении
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-900">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Icon name="Workflow" size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                Полный цикл автоматизации готов! 🎉
              </h4>
              <div className="text-sm text-emerald-700 dark:text-emerald-300">
                <strong>Удостоверение истекает через 90 дней</strong> → 
                Уведомление → 
                Автосоздание заявки → 
                Согласование → 
                Автоотправка в учебные центры → 
                Подтверждение обучения → 
                Прохождение курса → 
                <strong className="text-emerald-900 dark:text-emerald-100"> Автоматическое продление удостоверения</strong> → 
                Новый цикл через 5 лет
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
