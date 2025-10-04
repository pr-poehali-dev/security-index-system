import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function AttestationPage() {
  return (
    <div>
      <PageHeader
        title="Аттестация персонала"
        description="Управление аттестациями сотрудников"
        icon="GraduationCap"
      />
      <Card>
        <CardContent className="p-12 text-center">
          <Icon name="GraduationCap" className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold mb-2">Модуль в разработке</h3>
          <p className="text-gray-600 dark:text-gray-400">Функционал аттестации будет доступен в следующей версии</p>
        </CardContent>
      </Card>
    </div>
  );
}
