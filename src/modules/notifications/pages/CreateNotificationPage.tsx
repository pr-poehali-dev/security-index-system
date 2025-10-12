import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export default function CreateNotificationPage() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationsStore();
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('info');
  const [source, setSource] = useState<NotificationSource>('platform_news');
  const [link, setLink] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast.error('Заполните обязательные поля');
      return;
    }

    setIsSubmitting(true);

    try {
      addNotification({
        tenantId: 'global',
        type,
        source,
        title: title.trim(),
        message: message.trim(),
        link: link.trim() || undefined,
        isRead: false,
      });

      toast.success('Уведомление успешно отправлено!', {
        description: 'Все пользователи получат это уведомление',
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
        description="Отправить уведомление всем пользователям системы"
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
            <p className="text-sm text-muted-foreground">
              Выберите категорию для правильной группировки уведомления
            </p>
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
