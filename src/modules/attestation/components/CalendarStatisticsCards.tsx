import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface CalendarStatistics {
  thisMonth: number;
  nextMonth: number;
  thisYear: number;
  upcoming: number;
}

interface CalendarStatisticsCardsProps {
  statistics: CalendarStatistics;
}

export default function CalendarStatisticsCards({ statistics }: CalendarStatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="CalendarClock" className="text-blue-600" size={24} />
            <span className="text-2xl font-bold">{statistics.thisMonth}</span>
          </div>
          <p className="text-sm text-muted-foreground">Истекает в этом месяце</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Calendar" className="text-amber-600" size={24} />
            <span className="text-2xl font-bold">{statistics.nextMonth}</span>
          </div>
          <p className="text-sm text-muted-foreground">Истекает в следующем</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Clock" className="text-orange-600" size={24} />
            <span className="text-2xl font-bold">{statistics.upcoming}</span>
          </div>
          <p className="text-sm text-muted-foreground">Ближайшие 90 дней</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="TrendingUp" className="text-purple-600" size={24} />
            <span className="text-2xl font-bold">{statistics.thisYear}</span>
          </div>
          <p className="text-sm text-muted-foreground">Всего в этом году</p>
        </CardContent>
      </Card>
    </div>
  );
}
