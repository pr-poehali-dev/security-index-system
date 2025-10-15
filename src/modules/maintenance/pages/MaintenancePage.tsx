// src/modules/maintenance/pages/MaintenancePage.tsx
// Описание: Страница технического обслуживания - планирование и учет ремонтных работ
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function MaintenancePage() {
  return (
    <div>
      <PageHeader
        title="Ремонты и обслуживание"
        description="Планирование и учет ремонтных работ по промышленной безопасности"
        icon="Wrench"
      />
      
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="p-8 md:p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Icon name="Construction" size={32} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              Модуль в разработке
            </h2>
            <p className="text-amber-700 dark:text-amber-300 max-w-md">
              Модуль ремонтов и обслуживания находится в стадии разработки. 
              Скоро здесь можно будет планировать, назначать и отслеживать ремонтные работы на объектах.
            </p>
            <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-300 mt-2">
              Ожидается в следующей версии
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}