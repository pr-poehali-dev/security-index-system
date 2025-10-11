import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface TrainingsStatsProps {
  total: number;
  planned: number;
  inProgress: number;
  totalCost: number;
}

export default function TrainingsStats({ total, planned, inProgress, totalCost }: TrainingsStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всего обучений</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <Icon name="GraduationCap" size={24} className="text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Запланировано</p>
              <p className="text-2xl font-bold">{planned}</p>
            </div>
            <Icon name="CalendarClock" size={24} className="text-blue-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">В процессе</p>
              <p className="text-2xl font-bold">{inProgress}</p>
            </div>
            <Icon name="Clock" size={24} className="text-amber-500" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Бюджет</p>
              <p className="text-2xl font-bold">{totalCost.toLocaleString('ru')} ₽</p>
            </div>
            <Icon name="Wallet" size={24} className="text-emerald-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
