import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function TechnicalDiagnosticsTab() {
  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Icon name="Stethoscope" size={48} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">Планирование технических диагностик</h3>
            <p className="text-muted-foreground max-w-md">
              Раздел для планирования и учета технических диагностик оборудования находится в разработке
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
