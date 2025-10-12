// src/modules/training-center/components/tabs/ScheduleTab.tsx
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function ScheduleTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="Calendar" size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Расписание занятий</h3>
            <p className="text-muted-foreground max-w-md">
              Планирование и управление расписанием учебных занятий
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}