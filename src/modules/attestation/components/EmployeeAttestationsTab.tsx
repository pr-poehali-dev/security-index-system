import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import EmployeeCard from './EmployeeCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const employees = [
  { id: '1', name: 'Иванов Иван Иванович', position: 'Инженер', nextCert: '2025-11-20', status: 'valid' as const, daysLeft: 46 },
  { id: '2', name: 'Петрова Анна Сергеевна', position: 'Начальник участка', nextCert: '2025-10-25', status: 'expiring_soon' as const, daysLeft: 20 },
  { id: '3', name: 'Сидоров Петр Николаевич', position: 'Техник', nextCert: '2025-09-30', status: 'expired' as const, daysLeft: -5 },
  { id: '4', name: 'Кузнецов Алексей Владимирович', position: 'Электромонтер', nextCert: '2025-12-15', status: 'valid' as const, daysLeft: 71 },
  { id: '5', name: 'Морозова Елена Петровна', position: 'Инженер ОТ', nextCert: '2025-10-10', status: 'expiring_soon' as const, daysLeft: 5 },
];

interface EmployeeAttestationsTabProps {
  onAddEmployee?: () => void;
}

export default function EmployeeAttestationsTab({ onAddEmployee }: EmployeeAttestationsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: employees.length,
    valid: employees.filter(e => e.status === 'valid').length,
    expiring: employees.filter(e => e.status === 'expiring_soon').length,
    expired: employees.filter(e => e.status === 'expired').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="Users" className="text-blue-600" size={24} />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-sm text-muted-foreground">Всего сотрудников</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="CheckCircle2" className="text-emerald-600" size={24} />
              <span className="text-2xl font-bold">{stats.valid}</span>
            </div>
            <p className="text-sm text-muted-foreground">Действующие допуски</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="AlertTriangle" className="text-amber-600" size={24} />
              <span className="text-2xl font-bold">{stats.expiring}</span>
            </div>
            <p className="text-sm text-muted-foreground">Истекают (30 дней)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Icon name="XCircle" className="text-red-600" size={24} />
              <span className="text-2xl font-bold">{stats.expired}</span>
            </div>
            <p className="text-sm text-muted-foreground">Просрочено</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Реестр сотрудников</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="gap-2"
              >
                <Icon name="LayoutGrid" size={16} />
                Карточки
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="gap-2"
              >
                <Icon name="Table" size={16} />
                Таблица
              </Button>
              <Button onClick={onAddEmployee} className="gap-2">
                <Icon name="Plus" size={18} />
                Добавить
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по ФИО или должности..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="valid">Действующий</SelectItem>
                <SelectItem value="expiring_soon">Истекает</SelectItem>
                <SelectItem value="expired">Просрочен</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredEmployees.map((emp) => (
                <EmployeeCard key={emp.id} employee={emp} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-3 font-medium">ФИО</th>
                    <th className="pb-3 font-medium">Должность</th>
                    <th className="pb-3 font-medium">Следующая аттестация</th>
                    <th className="pb-3 font-medium">Статус</th>
                    <th className="pb-3 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="border-b last:border-0">
                      <td className="py-3">{emp.name}</td>
                      <td className="py-3 text-muted-foreground">{emp.position}</td>
                      <td className="py-3">{new Date(emp.nextCert).toLocaleDateString('ru')}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          emp.status === 'valid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          emp.status === 'expiring_soon' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          <Icon name={emp.status === 'valid' ? 'CheckCircle2' : emp.status === 'expiring_soon' ? 'AlertTriangle' : 'XCircle'} size={12} />
                          {emp.status === 'valid' ? 'Действующий' : emp.status === 'expiring_soon' ? 'Истекает' : 'Просрочен'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Icon name="Eye" size={16} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Icon name="Edit" size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Сотрудники не найдены
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
