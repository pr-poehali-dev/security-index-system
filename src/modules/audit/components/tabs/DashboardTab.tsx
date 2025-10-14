// src/modules/audit/components/tabs/DashboardTab.tsx
// Дашборд модуля аудита с основными метриками и статистикой

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const DashboardTab = memo(function DashboardTab() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-2xl font-semibold text-muted-foreground">
            Модуль в разработке
          </p>
          <p className="text-sm text-muted-foreground">
            Дашборд аудита скоро будет доступен
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

export default DashboardTab;
