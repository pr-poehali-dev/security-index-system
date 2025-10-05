import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface StatsCardsProps {
  checklistsCount: number;
  scheduledCount: number;
  inProgressCount: number;
  completedCount: number;
  upcomingCount: number;
}

export default function StatsCards({
  checklistsCount,
  scheduledCount,
  inProgressCount,
  completedCount,
  upcomingCount
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="FileText" className="text-gray-600" size={24} />
            <span className="text-3xl font-bold">{checklistsCount}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Шаблонов</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Calendar" className="text-blue-600" size={24} />
            <span className="text-3xl font-bold">{scheduledCount}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Запланировано</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Play" className="text-purple-600" size={24} />
            <span className="text-3xl font-bold">{inProgressCount}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">В процессе</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="CheckCircle2" className="text-green-600" size={24} />
            <span className="text-3xl font-bold">{completedCount}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Завершено</p>
        </CardContent>
      </Card>

      <Card className={upcomingCount > 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Icon name="Bell" className="text-yellow-600" size={24} />
            <span className="text-3xl font-bold text-yellow-600">{upcomingCount}</span>
          </div>
          <p className="text-sm text-yellow-600 font-medium">Скоро</p>
        </CardContent>
      </Card>
    </div>
  );
}
