import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function IndustrialSafetyExpertiseTab() {
  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/30">
            <Icon name="ShieldCheck" size={48} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">Планирование экспертизы промышленной безопасности</h3>
            <p className="text-muted-foreground max-w-md">
              Раздел для планирования и учета экспертизы промышленной безопасности находится в разработке
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
