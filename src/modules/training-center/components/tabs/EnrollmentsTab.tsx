import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function EnrollmentsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="Users" size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Обучающиеся</h3>
            <p className="text-muted-foreground max-w-md">
              Управление зачислением студентов, отслеживание посещаемости и результатов обучения
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
