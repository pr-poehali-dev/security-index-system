import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function OpoCharacteristicsTab() {
  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Icon name="Construction" size={48} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">В режиме разработки</h3>
            <p className="text-muted-foreground max-w-md">
              Раздел "Сведения характеризующие ОПО" находится в стадии разработки и скоро будет доступен
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
