import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll, getUnreadCount } = useNotificationsStore();

  const unreadCount = getUnreadCount();

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications]);

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

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Icon name="Bell" size={20} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Уведомления</h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Прочитать все
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  clearAll();
                }}
                className="text-xs text-destructive hover:text-destructive"
              >
                <Icon name="Trash2" size={14} className="mr-1" />
                Очистить
              </Button>
            )}
          </div>
        </div>

        {sortedNotifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Icon name="Bell" size={48} className="mx-auto mb-2 opacity-20" />
            <p>Нет уведомлений</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="divide-y">
              {sortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  } ${notification.link ? 'cursor-pointer' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Icon name="X" size={14} />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            Новое
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {sortedNotifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                navigate('/notifications');
                setIsOpen(false);
              }}
            >
              Показать все уведомления
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}