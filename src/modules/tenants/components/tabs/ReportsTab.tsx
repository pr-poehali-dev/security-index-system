import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon, { type IconName } from '@/components/ui/icon';

export default function ReportsTab() {
  const reports: Array<{
    title: string;
    description: string;
    icon: IconName;
    format: string;
  }> = [
    {
      title: 'Общий отчет по тенантам',
      description: 'Полный список тенантов с информацией о статусе, модулях и сроках действия',
      icon: 'FileText',
      format: 'Excel'
    },
    {
      title: 'Отчет по активности',
      description: 'Статистика использования модулей и активности пользователей по тенантам',
      icon: 'Activity',
      format: 'PDF'
    },
    {
      title: 'Отчет по истекающим лицензиям',
      description: 'Список тенантов с истекающими или истекшими лицензиями',
      icon: 'AlertTriangle',
      format: 'Excel'
    },
    {
      title: 'Финансовый отчет',
      description: 'Отчет о доходах, подписках и оплатах по тенантам',
      icon: 'DollarSign',
      format: 'PDF'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Доступные отчеты</CardTitle>
          <CardDescription>
            Генерация и экспорт отчетов по тенантам системы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <Card key={report.title} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={report.icon} className="text-emerald-600" size={24} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {report.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {report.description}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <Icon name="Download" className="mr-2" size={16} />
                        Скачать {report.format}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Запланированные отчеты</CardTitle>
          <CardDescription>
            Автоматическая генерация и отправка отчетов по расписанию
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="CalendarClock" className="text-gray-400" size={32} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Запланированных отчетов пока нет
            </p>
            <Button variant="outline">
              <Icon name="Plus" className="mr-2" size={16} />
              Создать расписание
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}