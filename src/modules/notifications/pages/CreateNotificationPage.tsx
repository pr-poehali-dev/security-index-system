import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useTenantStore } from '@/stores/tenantStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import PageHeader from '@/components/layout/PageHeader';
import type { NotificationType, NotificationSource } from '@/types';
import { toast } from 'sonner';

type RecipientType = 'all' | 'tenants' | 'users';

const MOCK_USERS = [
  { id: '1', name: 'Суперадминистратор', email: 'superadmin@system.ru', tenantId: null },
  { id: '2', name: 'Администратор Тенанта', email: 'admin@company.ru', tenantId: 'tenant-1' },
  { id: '3', name: 'Аудитор', email: 'auditor@company.ru', tenantId: 'tenant-1' },
  { id: '4', name: 'Менеджер', email: 'manager@company.ru', tenantId: 'tenant-1' },
  { id: '5', name: 'Директор', email: 'director@company.ru', tenantId: 'tenant-1' },
  { id: '6', name: 'Менеджер Учебного Центра', email: 'training@company.ru', tenantId: 'tenant-1' },
];

export default function CreateNotificationPage() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationsStore();
  const { tenants } = useTenantStore();
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('info');
  const [source, setSource] = useState<NotificationSource>('platform_news');
  const [link, setLink] = useState('');
  const [recipientType, setRecipientType] = useState<RecipientType>('all');
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notificationTypes: { value: NotificationType; label: string; icon: string }[] = [
    { value: 'info', label: 'Информация', icon: 'Info' },
    { value: 'success', label: 'Успех', icon: 'CheckCircle' },
    { value: 'warning', label: 'Предупреждение', icon: 'AlertTriangle' },
    { value: 'critical', label: 'Критическое', icon: 'AlertCircle' },
  ];

  const notificationSources: { value: NotificationSource; label: string; description: string }[] = [
    { value: 'platform_news', label: 'Новости платформы', description: 'Анонсы обновлений и улучшений' },
    { value: 'system', label: 'Системное', description: 'Технические сообщения' },
    { value: 'incident', label: 'Инциденты', description: 'Сообщения об инцидентах' },
    { value: 'attestation', label: 'Аттестация', description: 'Уведомления по аттестации' },
    { value: 'catalog', label: 'Каталог объектов', description: 'Обновления каталога' },
    { value: 'audit', label: 'Аудит', description: 'Аудиторские проверки' },
  ];

  const handleTenantToggle = (tenantId: string) => {
    setSelectedTenants(prev => 
      prev.includes(tenantId) 
        ? prev.filter(id => id !== tenantId)
        : [...prev, tenantId]
    );
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast.error('Заполните обязательные поля');
      return;
    }

    if (recipientType === 'tenants' && selectedTenants.length === 0) {
      toast.error('Выберите хотя бы одну организацию');
      return;
    }

    if (recipientType === 'users' && selectedUsers.length === 0) {
      toast.error('Выберите хотя бы одного пользователя');
      return;
    }

    setIsSubmitting(true);

    try {
      if (recipientType === 'all') {
        addNotification({
          tenantId: 'global',
          type,
          source,
          title: title.trim(),
          message: message.trim(),
          link: link.trim() || undefined,
          isRead: false,
        });
      } else if (recipientType === 'tenants') {
        selectedTenants.forEach(tenantId => {
          addNotification({
            tenantId,
            type,
            source,
            title: title.trim(),
            message: message.trim(),
            link: link.trim() || undefined,
            isRead: false,
          });
        });
      } else if (recipientType === 'users') {
        selectedUsers.forEach(userId => {
          addNotification({
            tenantId: 'global',
            userId,
            type,
            source,
            title: title.trim(),
            message: message.trim(),
            link: link.trim() || undefined,
            isRead: false,
          });
        });
      }

      const recipientCount = 
        recipientType === 'all' ? 'всем пользователям' :
        recipientType === 'tenants' ? `${selectedTenants.length} организациям` :
        `${selectedUsers.length} пользователям`;

      toast.success('Уведомление успешно отправлено!', {
        description: `Отправлено ${recipientCount}`,
      });

      setTimeout(() => {
        navigate('/notifications');
      }, 1000);
    } catch (error) {
      toast.error('Ошибка отправки уведомления');
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (iconName: string) => {
    return <Icon name={iconName} size={16} />;
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Создать уведомление"
        description="Отправить уведомление пользователям системы"
        action={
          <Button 
            variant="outline" 
            onClick={() => navigate('/notifications')}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={16} />
            Назад
          </Button>
        }
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>
              Получатели <span className="text-red-500">*</span>
            </Label>
            <RadioGroup value={recipientType} onValueChange={(v) => setRecipientType(v as RecipientType)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Icon name="Users" size={16} />
                    <span className="font-medium">Всем пользователям</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Уведомление получат все пользователи системы
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="tenants" id="tenants" />
                <Label htmlFor="tenants" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Icon name="Building2" size={16} />
                    <span className="font-medium">Конкретным организациям</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Выберите организации-получатели
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="users" id="users" />
                <Label htmlFor="users" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Icon name="User" size={16} />
                    <span className="font-medium">Конкретным пользователям</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Выберите пользователей-получателей
                  </p>
                </Label>
              </div>
            </RadioGroup>

            {recipientType === 'tenants' && (
              <Card className="p-4 bg-muted/30">
                <Label className="mb-3 block">Выберите организации:</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center space-x-2 p-2 hover:bg-background rounded">
                      <Checkbox
                        id={`tenant-${tenant.id}`}
                        checked={selectedTenants.includes(tenant.id)}
                        onCheckedChange={() => handleTenantToggle(tenant.id)}
                      />
                      <Label
                        htmlFor={`tenant-${tenant.id}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        <div className="font-medium">{tenant.name}</div>
                        <div className="text-xs text-muted-foreground">ИНН: {tenant.inn}</div>
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedTenants.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Выбрано: {selectedTenants.length} из {tenants.length}
                  </p>
                )}
              </Card>
            )}

            {recipientType === 'users' && (
              <Card className="p-4 bg-muted/30">
                <Label className="mb-3 block">Выберите пользователей:</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {MOCK_USERS.map((user) => (
                    <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-background rounded">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleUserToggle(user.id)}
                      />
                      <Label
                        htmlFor={`user-${user.id}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedUsers.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Выбрано: {selectedUsers.length} из {MOCK_USERS.length}
                  </p>
                )}
              </Card>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">
              Тип уведомления <span className="text-red-500">*</span>
            </Label>
            <Select value={type} onValueChange={(v) => setType(v as NotificationType)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(t.icon)}
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">
              Источник <span className="text-red-500">*</span>
            </Label>
            <Select value={source} onValueChange={(v) => setSource(v as NotificationSource)}>
              <SelectTrigger id="source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {notificationSources.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    <div>
                      <div className="font-medium">{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Заголовок <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Краткий заголовок уведомления"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Сообщение <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Подробное описание уведомления"
              rows={4}
              maxLength={500}
              required
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500 символов
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">
              Ссылка (необязательно)
            </Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/incidents или https://example.com"
            />
            <p className="text-sm text-muted-foreground">
              При клике на уведомление пользователь перейдёт по этой ссылке
            </p>
          </div>

          <div className="pt-4 border-t">
            <Card className="p-4 bg-muted/50">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Icon name="Eye" size={16} />
                Предпросмотр
              </h3>
              <div className="bg-background p-4 rounded-lg border">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {type === 'critical' && <Icon name="AlertCircle" size={24} className="text-red-500" />}
                    {type === 'warning' && <Icon name="AlertTriangle" size={24} className="text-orange-500" />}
                    {type === 'success' && <Icon name="CheckCircle" size={24} className="text-green-500" />}
                    {type === 'info' && <Icon name="Info" size={24} className="text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {title || 'Заголовок уведомления'}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {message || 'Текст сообщения будет отображаться здесь'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-md border">
                        {notificationSources.find(s => s.value === source)?.label}
                      </span>
                      <span className="text-xs text-muted-foreground">только что</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
                  <Icon name="Info" size={16} className="mt-0.5 flex-shrink-0" />
                  <span>
                    {recipientType === 'all' && 'Будет отправлено всем пользователям системы'}
                    {recipientType === 'tenants' && `Будет отправлено пользователям ${selectedTenants.length} организаций`}
                    {recipientType === 'users' && `Будет отправлено ${selectedUsers.length} пользователям`}
                  </span>
                </p>
              </div>
            </Card>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !message.trim()}
              className="gap-2"
            >
              <Icon name="Send" size={16} />
              {isSubmitting ? 'Отправка...' : 'Отправить уведомление'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/notifications')}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}