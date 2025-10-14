// src/modules/maintenance/pages/MaintenancePage.tsx
// Описание: Страница технического обслуживания - планирование и учет ремонтных работ
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function MaintenancePage() {
  return (
    <div>
      <PageHeader
        title="Ремонты и обслуживание"
        description="Модуль находится в разработке"
      />
      <Card className="mx-6 mt-6">
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Icon name="Construction" size={64} className="text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
            Модуль находится в разработке
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Функционал планирования и учета ремонтов будет доступен в ближайшее время
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
