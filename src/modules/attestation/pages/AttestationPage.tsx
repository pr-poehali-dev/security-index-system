import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import EmployeeCard from '../components/EmployeeCard';
import UpcomingAttestationCard from '../components/UpcomingAttestationCard';

const employees = [
  { id: '1', name: 'Иванов Иван Иванович', position: 'Инженер', nextCert: '2025-11-20', status: 'valid' as const, daysLeft: 46 },
  { id: '2', name: 'Петрова Анна Сергеевна', position: 'Начальник участка', nextCert: '2025-10-25', status: 'expiring_soon' as const, daysLeft: 20 },
  { id: '3', name: 'Сидоров Петр Николаевич', position: 'Техник', nextCert: '2025-09-30', status: 'expired' as const, daysLeft: -5 }
];

export default function AttestationPage() {
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
                <EmployeeCard key={emp.id} employee={emp} />
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
                <UpcomingAttestationCard key={emp.id} employee={emp} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
