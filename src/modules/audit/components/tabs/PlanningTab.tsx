// src/modules/audit/components/tabs/PlanningTab.tsx
// Планирование аудитов промышленной безопасности

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const PlanningTab = memo(function PlanningTab() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-2xl font-semibold text-muted-foreground">
            Модуль в разработке
          </p>
          <p className="text-sm text-muted-foreground">
            Планирование аудита скоро будет доступно
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

export default PlanningTab;
