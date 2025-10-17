import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function ReportsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="FileBarChart" size={20} />
          Отчеты и аналитика
        </CardTitle>
        <CardDescription>
          Аналитика по объектам и подрядчикам
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Icon name="FileBarChart" size={48} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Отчеты в разработке</h3>
          <p className="text-muted-foreground max-w-md">
            Здесь будет доступна аналитика по объектам, подрядчикам и статистика работ
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
