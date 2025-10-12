import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useTenantStore } from '@/stores/tenantStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import PageHeader from '@/components/layout/PageHeader';
import { formatDistanceToNow, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { NotificationType, NotificationSource } from '@/types';

const MOCK_USERS = [
  { id: '1', name: 'Суперадминистратор', email: 'superadmin@system.ru', tenantId: null },
  { id: '2', name: 'Администратор Тенанта', email: 'admin@company.ru', tenantId: 'tenant-1' },
  { id: '3', name: 'Аудитор', email: 'auditor@company.ru', tenantId: 'tenant-1' },
  { id: '4', name: 'Менеджер', email: 'manager@company.ru', tenantId: 'tenant-1' },
  { id: '5', name: 'Директор', email: 'director@company.ru', tenantId: 'tenant-1' },
  { id: '6', name: 'Менеджер Учебного Центра', email: 'training@company.ru', tenantId: 'tenant-1' },
];

export default function NotificationsHistoryPage() {
  const navigate = useNavigate();
  const { getHistory } = useNotificationsStore();
  const { tenants } = useTenantStore();
  const history = getHistory();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterSource, setFilterSource] = useState<NotificationSource | 'all'>('all');
  const [filterRecipient, setFilterRecipient] = useState<'all' | 'tenants' | 'users'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const notificationTypes: { value: NotificationType | 'all'; label: string }[] = [
    { value: 'all', label: 'Все типы' },
    { value: 'info', label: 'Информация' },
    { value: 'success', label: 'Успех' },
    { value: 'warning', label: 'Предупреждение' },
    { value: 'critical', label: 'Критическое' },
  ];

  const notificationSources: { value: NotificationSource | 'all'; label: string }[] = [
    { value: 'all', label: 'Все источники' },
    { value: 'platform_news', label: 'Новости платформы' },
    { value: 'system', label: 'Системное' },
    { value: 'incident', label: 'Инциденты' },
    { value: 'attestation', label: 'Аттестация' },
    { value: 'catalog', label: 'Каталог объектов' },
    { value: 'audit', label: 'Аудит' },
  ];

  const recipientTypes = [
    { value: 'all', label: 'Все получатели' },
    { value: 'tenants', label: 'Организации' },
    { value: 'users', label: 'Пользователи' },
  ];

  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      const notification = entry.notification;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!notification.title.toLowerCase().includes(query) &&
            !notification.message.toLowerCase().includes(query)) {
          return false;
        }
      }

      if (filterType !== 'all' && notification.type !== filterType) {
        return false;
      }

      if (filterSource !== 'all' && notification.source !== filterSource) {
        return false;
      }

      if (filterRecipient !== 'all' && entry.recipients.type !== filterRecipient) {
        return false;
      }

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        const sentDate = new Date(entry.sentAt);
        if (sentDate < fromDate) {
          return false;
        }
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        const sentDate = new Date(entry.sentAt);
        if (sentDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [history, searchQuery, filterType, filterSource, filterRecipient, dateFrom, dateTo]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <Icon name="AlertCircle" size={20} className="text-red-500" />;
      case 'warning':
        return <Icon name="AlertTriangle" size={20} className="text-orange-500" />;
      case 'success':
        return <Icon name="CheckCircle" size={20} className="text-green-500" />;
      default:
        return <Icon name="Info" size={20} className="text-blue-500" />;
    }
  };

  const getSourceLabel = (source: string) => {
    const found = notificationSources.find(s => s.value === source);
    return found?.label || source;
  };

  const getTypeLabel = (type: string) => {
    const found = notificationTypes.find(t => t.value === type);
    return found?.label || type;
  };

  const getRecipientsText = (entry: typeof history[0]) => {
    if (entry.recipients.type === 'all') {
      return 'Всем пользователям';
    }
    
    if (entry.recipients.type === 'tenants' && entry.recipients.tenantIds) {
      const count = entry.recipients.tenantIds.length;
      const tenantNames = entry.recipients.tenantIds
        .slice(0, 2)
        .map(id => tenants.find(t => t.id === id)?.name)
        .filter(Boolean);
      
      if (count === 1) {
        return tenantNames[0] || '1 организация';
      }
      return `${tenantNames.join(', ')}${count > 2 ? ` и ещё ${count - 2}` : ''}`;
    }

    if (entry.recipients.type === 'users' && entry.recipients.userIds) {
      const count = entry.recipients.userIds.length;
      const userNames = entry.recipients.userIds
        .slice(0, 2)
        .map(id => MOCK_USERS.find(u => u.id === id)?.name)
        .filter(Boolean);
      
      if (count === 1) {
        return userNames[0] || '1 пользователь';
      }
      return `${userNames.join(', ')}${count > 2 ? ` и ещё ${count - 2}` : ''}`;
    }

    return 'Неизвестно';
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ru,
      });
    } catch {
      return 'недавно';
    }
  };

  const formatFullDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: ru });
    } catch {
      return dateString;
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterSource('all');
    setFilterRecipient('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchQuery || filterType !== 'all' || filterSource !== 'all' || 
                          filterRecipient !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      <PageHeader
        title="История уведомлений"
        description="Все отправленные уведомления с фильтрацией"
        action={
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/notifications/create')}
              className="gap-2"
            >
              <Icon name="Plus" size={16} />
              Создать уведомление
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/notifications')}
              className="gap-2"
            >
              <Icon name="ArrowLeft" size={16} />
              Назад
            </Button>
          </div>
        }
      />

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon name="Filter" size={20} />
              Фильтры
            </h3>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetFilters}
                className="gap-2"
              >
                <Icon name="X" size={14} />
                Сбросить
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Поиск</Label>
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Заголовок или текст..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Тип</Label>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Источник</Label>
              <Select value={filterSource} onValueChange={(v) => setFilterSource(v as typeof filterSource)}>
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationSources.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Получатели</Label>
              <Select value={filterRecipient} onValueChange={(v) => setFilterRecipient(v as typeof filterRecipient)}>
                <SelectTrigger id="recipient">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recipientTypes.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">Дата от</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Дата до</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Найдено: <span className="font-semibold text-foreground">{filteredHistory.length}</span> из {history.length}
        </p>
      </div>

      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Icon name="History" size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">
                {hasActiveFilters ? 'Ничего не найдено' : 'История пуста'}
              </p>
              <p className="text-sm mt-2">
                {hasActiveFilters 
                  ? 'Попробуйте изменить параметры фильтрации'
                  : 'Отправленные уведомления появятся здесь'}
              </p>
            </div>
          </Card>
        ) : (
          filteredHistory.map((entry) => (
            <Card key={entry.id} className="p-5 hover:bg-muted/30 transition-colors">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(entry.notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-base">
                        {entry.notification.title}
                      </h3>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(entry.sentAt)}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatFullDate(entry.sentAt)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {entry.notification.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Icon name="Tag" size={12} />
                        {getTypeLabel(entry.notification.type)}
                      </Badge>
                      
                      <Badge variant="outline" className="gap-1">
                        <Icon name="Layers" size={12} />
                        {getSourceLabel(entry.notification.source)}
                      </Badge>

                      <Badge variant="secondary" className="gap-1">
                        <Icon name="Users" size={12} />
                        {getRecipientsText(entry)}
                      </Badge>

                      {entry.notification.link && (
                        <Badge variant="outline" className="gap-1">
                          <Icon name="Link" size={12} />
                          Со ссылкой
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
