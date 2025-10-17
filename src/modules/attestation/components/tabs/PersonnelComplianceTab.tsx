import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import PersonnelComplianceCard from '../personnel/PersonnelComplianceCard';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';

const mockPersonnel = [
  {
    id: 'personnel-1',
    name: 'Иванов Петр Сергеевич',
    position: 'Начальник смены',
    organizationId: 'org-1',
    organizationName: 'ГЭС-1',
    requiredAreas: [
      {
        code: 'А.1',
        name: 'Основы промышленной безопасности',
        category: 'industrial_safety' as const,
        requiresDpo: true
      },
      {
        code: 'Б.3',
        name: 'Эксплуатация объектов электроэнергетики',
        category: 'energy_safety' as const,
        requiresDpo: true
      }
    ]
  },
  {
    id: 'personnel-2',
    name: 'Петров Иван Сергеевич',
    position: 'Главный энергетик',
    organizationId: 'org-1',
    organizationName: 'ГЭС-1',
    requiredAreas: [
      {
        code: 'А.1',
        name: 'Основы промышленной безопасности',
        category: 'industrial_safety' as const,
        requiresDpo: true
      }
    ]
  },
  {
    id: 'personnel-3',
    name: 'Сидорова Анна Владимировна',
    position: 'Инженер по охране труда',
    organizationId: 'org-1',
    organizationName: 'ГЭС-1',
    requiredAreas: [
      {
        code: 'А.1',
        name: 'Основы промышленной безопасности',
        category: 'industrial_safety' as const,
        requiresDpo: true
      },
      {
        code: 'Б.3',
        name: 'Эксплуатация объектов электроэнергетики',
        category: 'energy_safety' as const,
        requiresDpo: true
      }
    ]
  }
];

export default function PersonnelComplianceTab() {
  const user = useAuthStore((state) => state.user);
  const { organizations = [] } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState('all');
  const [complianceFilter, setComplianceFilter] = useState('all');

  const filteredPersonnel = useMemo(() => {
    return mockPersonnel.filter(person => {
      const matchesSearch = searchQuery === '' || 
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.position.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOrganization = organizationFilter === 'all' || 
        person.organizationId === organizationFilter;

      return matchesSearch && matchesOrganization;
    });
  }, [searchQuery, organizationFilter]);

  const stats = useMemo(() => {
    return {
      total: mockPersonnel.length,
      compliant: mockPersonnel.filter(p => p.id === 'personnel-1').length,
      needsAction: mockPersonnel.filter(p => p.id !== 'personnel-1').length,
      expired: mockPersonnel.filter(p => p.id === 'personnel-2').length
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего сотрудников</CardTitle>
            <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Соответствуют</CardTitle>
            <Icon name="CheckCircle" className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.compliant}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.compliant / stats.total) * 100)}% от общего числа
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Требуют действий</CardTitle>
            <Icon name="AlertCircle" className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.needsAction}</div>
            <p className="text-xs text-muted-foreground">
              Обучение или аттестация
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Просрочено</CardTitle>
            <Icon name="XCircle" className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">
              Срочно требуют обновления
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>Соответствие требованиям по должностям</CardTitle>
              <CardDescription>
                Проверка наличия ДПО и аттестации по требуемым областям для каждого сотрудника
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Icon 
                  name="Search" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                  size={18} 
                />
                <Input
                  placeholder="Поиск по ФИО или должности..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Организация" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все организации</SelectItem>
                  <SelectItem value="org-1">ГЭС-1</SelectItem>
                  <SelectItem value="org-2">ГЭС-2</SelectItem>
                </SelectContent>
              </Select>

              <Select value={complianceFilter} onValueChange={setComplianceFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="compliant">Соответствуют</SelectItem>
                  <SelectItem value="needs_action">Требуют действий</SelectItem>
                  <SelectItem value="expired">Просрочено</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Icon name="Download" size={18} className="mr-2" />
                Экспорт
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPersonnel.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Users" size={48} className="mx-auto mb-4 opacity-20" />
              <p>Нет сотрудников по заданным критериям</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPersonnel.map((person) => (
                <PersonnelComplianceCard
                  key={person.id}
                  personnelId={person.id}
                  personnelName={person.name}
                  position={person.position}
                  requiredAreas={person.requiredAreas}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
