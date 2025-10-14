// src/modules/examination/pages/ExaminationPage.tsx
// Описание: Страница технической экспертизы - освидетельствования и заключения
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';



export default function ExaminationPage() {
  return (
    <div>
      <PageHeader
        title="Техническое диагностирование"
        description="Модуль находится в разработке"
      />
      <Card className="mx-6 mt-6">
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Icon name="Construction" size={64} className="text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
            Модуль находится в разработке
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Функционал технического диагностирования будет доступен в ближайшее время
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

