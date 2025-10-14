// src/modules/audit/components/tabs/CompletedAuditsTab.tsx
// Архив завершенных аудитов с результатами

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const CompletedAuditsTab = memo(function CompletedAuditsTab() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-2xl font-semibold text-muted-foreground">
            Модуль в разработке
          </p>
          <p className="text-sm text-muted-foreground">
            Завершенные аудиты скоро будут доступны
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

export default CompletedAuditsTab;
