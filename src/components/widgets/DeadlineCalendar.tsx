import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface DeadlineEvent {
  id: string;
  title: string;
  date: Date;
  type: 'task' | 'expertise';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  status?: string;
}

interface DeadlineCalendarProps {
  tasks?: Array<{ id: string; title: string; dueDate: string; priority: string; status: string }>;
  expertises?: Array<{ id: string; objectName: string; nextExpertiseDate: string }>;
  onEventClick?: (event: DeadlineEvent) => void;
}

export default function DeadlineCalendar({ tasks = [], expertises = [], onEventClick }: DeadlineCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const events: DeadlineEvent[] = useMemo(() => {
    const taskEvents: DeadlineEvent[] = tasks
      .filter(task => task.status !== 'completed' && task.status !== 'cancelled')
      .map(task => ({
        id: task.id,
        title: task.title,
        date: new Date(task.dueDate),
        type: 'task' as const,
        priority: (task.priority === 'critical' || task.priority === 'high' || task.priority === 'medium' || task.priority === 'low') 
          ? task.priority 
          : undefined,
        status: task.status
      }));

    const expertiseEvents: DeadlineEvent[] = expertises
      .filter(exp => exp.nextExpertiseDate)
      .map(exp => ({
        id: exp.id,
        title: `ЭПБ: ${exp.objectName}`,
        date: new Date(exp.nextExpertiseDate),
        type: 'expertise' as const
      }));

    return [...taskEvents, ...expertiseEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [tasks, expertises]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      const eventDate = event.date;
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isOverdue = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const calendarDays = [];
  const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
  
  for (let i = 0; i < adjustedStartDay; i++) {
    calendarDays.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const upcomingEvents = events
    .filter(event => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Calendar" size={20} />
            Календарь дедлайнов
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <Icon name="ChevronLeft" size={16} />
            </Button>
            <div className="flex items-center gap-2 px-3">
              <span className="font-semibold">{monthNames[month]} {year}</span>
            </div>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <Icon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dayEvents = getEventsForDay(day);
            const hasOverdue = dayEvents.some(e => isOverdue(e.date));

            return (
              <div
                key={day}
                className={`
                  aspect-square border rounded-lg p-1 transition-colors cursor-pointer
                  ${isToday(day) ? 'border-primary border-2 bg-primary/5' : 'border-border'}
                  ${dayEvents.length > 0 ? 'hover:bg-muted/50' : ''}
                  ${hasOverdue ? 'bg-red-50 dark:bg-red-950/20' : ''}
                `}
              >
                <div className="text-sm font-medium text-center mb-1">{day}</div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className="group relative"
                    >
                      <div className={`h-1.5 rounded-full ${getPriorityColor(event.priority)}`} />
                      <div className="hidden group-hover:block absolute z-10 bg-popover border rounded-md p-2 text-xs whitespace-nowrap -top-8 left-0 shadow-lg">
                        {event.title}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-muted-foreground text-center">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Icon name="AlertCircle" size={16} />
            Ближайшие дедлайны
          </h3>
          <div className="space-y-2">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Нет предстоящих дедлайнов
              </p>
            ) : (
              upcomingEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.date.toLocaleDateString('ru-RU', { 
                          day: 'numeric', 
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={event.type === 'task' ? 'default' : 'secondary'}>
                    {event.type === 'task' ? 'Задача' : 'ЭПБ'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Критический</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>Высокий</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Средний</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Низкий</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span>ЭПБ</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}