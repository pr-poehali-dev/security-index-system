import { useMemo, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ROUTES } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const NotificationsWidget = memo(function NotificationsWidget() {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const { notifications, markAsRead } = useNotificationsStore();

  const recentNotifications = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const criticalCount = notifications.filter(n => n.type === 'critical' && !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <Icon name="AlertCircle" size={16} className="text-red-500" />;
      case 'warning':
        return <Icon name="AlertTriangle" size={16} className="text-orange-500" />;
      case 'success':
        return <Icon name="CheckCircle" size={16} className="text-green-500" />;
      default:
        return <Icon name="Info" size={16} className="text-blue-500" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'incident':
        return 'Инциденты';
      case 'attestation':
        return 'Аттестация';
      case 'catalog':
        return 'Каталог';
      default:
        return 'Система';
    }
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
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

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Icon name="Bell" size={20} className="text-blue-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                  Уведомления
                </h3>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5">
                    {unreadCount}
                  </Badge>
                )}
                {criticalCount > 0 && (
                  <Badge variant="destructive" className="h-5 bg-red-600">
                    <Icon name="AlertCircle" size={12} className="mr-1" />
                    {criticalCount} критических
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isExpanded 
                  ? `Показаны последние ${recentNotifications.length} уведомлений` 
                  : `${unreadCount} новых, ${notifications.length} всего`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="gap-2"
            >
              {isExpanded ? (
                <>
                  <Icon name="ChevronUp" size={16} />
                  Свернуть
                </>
              ) : (
                <>
                  <Icon name="ChevronDown" size={16} />
                  Показать
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(ROUTES.NOTIFICATIONS)}
              className="gap-2"
            >
              Все уведомления
              <Icon name="ArrowRight" size={14} />
            </Button>
          </div>
        </div>

        {isExpanded && recentNotifications.length > 0 && (
          <div className="mt-4 space-y-2">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                  !notification.isRead
                    ? 'border-l-4 border-l-primary bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-2.5">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-gray-900 dark:text-white truncate ${!notification.isRead ? 'font-semibold' : ''}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        {getSourceLabel(notification.source)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default NotificationsWidget;