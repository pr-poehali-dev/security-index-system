import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

export default function AttestationPage() {
  const employees = [
    { id: '1', name: 'Иванов Иван Иванович', position: 'Инженер', nextCert: '2025-11-20', status: 'valid', daysLeft: 46 },
    { id: '2', name: 'Петрова Анна Сергеевна', position: 'Начальник участка', nextCert: '2025-10-25', status: 'expiring_soon', daysLeft: 20 },
    { id: '3', name: 'Сидоров Петр Николаевич', position: 'Техник', nextCert: '2025-09-30', status: 'expired', daysLeft: -5 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-emerald-100 text-emerald-700';
      case 'expiring_soon': return 'bg-amber-100 text-amber-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'valid': return 'Действителен';
      case 'expiring_soon': return 'Истекает';
      case 'expired': return 'Просрочен';
      default: return status;
    }
  };

  return (
    <div>
      <PageHeader
        title="Аттестация персонала"
        description="Управление аттестациями и допусками сотрудников"
        icon="GraduationCap"
        action={
          <Button className="gap-2">
            <Icon name="Plus" size={18} />
            Добавить сотрудника
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Users" className="text-blue-600" size={24} />
              <span className="text-2xl font-bold">48</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Всего сотрудников</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle2" className="text-emerald-600" size={24} />
              <span className="text-2xl font-bold">42</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Действующие допуски</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="AlertTriangle" className="text-amber-600" size={24} />
              <span className="text-2xl font-bold">4</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Истекают (30 дней)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="XCircle" className="text-red-600" size={24} />
              <span className="text-2xl font-bold">2</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Просрочено</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Реестр сотрудников</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employees.map((emp) => (
                <div key={emp.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{emp.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{emp.position}</p>
                    </div>
                    <Badge className={getStatusColor(emp.status)}>
                      {getStatusLabel(emp.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" size={14} className="text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Аттестация: {new Date(emp.nextCert).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <span className={emp.daysLeft < 0 ? 'text-red-600' : emp.daysLeft <= 30 ? 'text-amber-600' : 'text-gray-600'}>
                      {emp.daysLeft < 0 ? `Просрочено на ${Math.abs(emp.daysLeft)} дн.` : `Осталось ${emp.daysLeft} дн.`}
                    </span>
                  </div>
                  <Progress value={Math.max(0, 100 - (emp.daysLeft / 365) * 100)} className="h-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Предстоящие аттестации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employees.filter(e => e.status !== 'valid').map((emp) => (
                <div key={emp.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{emp.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{emp.position}</p>
                    </div>
                    <Badge variant={emp.status === 'expired' ? 'destructive' : 'secondary'} className="text-xs">
                      {emp.daysLeft < 0 ? 'Просрочено' : `${emp.daysLeft} дн.`}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                    <Icon name="Calendar" size={12} />
                    <span>{new Date(emp.nextCert).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}