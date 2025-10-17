import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface IndustrialSafetyExpertise {
  id: string;
  facilityName: string;
  expertiseType: string;
  plannedDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'overdue';
  expertOrganization?: string;
  notes?: string;
}

const mockExpertises: IndustrialSafetyExpertise[] = [
  {
    id: '1',
    facilityName: 'ОПО "Котельная №1"',
    expertiseType: 'Полная ЭПБ',
    plannedDate: '2025-12-10',
    status: 'planned',
    expertOrganization: 'ООО "ПромБезопасность"',
    notes: 'Истекает срок действия предыдущей экспертизы'
  },
  {
    id: '2',
    facilityName: 'ОПО "Газопровод высокого давления"',
    expertiseType: 'Проектная документация',
    plannedDate: '2025-10-25',
    status: 'in-progress',
    expertOrganization: 'АО "Экспертцентр"',
  },
  {
    id: '3',
    facilityName: 'ОПО "Резервуарный парк"',
    expertiseType: 'Полная ЭПБ',
    plannedDate: '2025-10-05',
    status: 'overdue',
    expertOrganization: 'ООО "СпецЭксперт"',
    notes: 'Ожидание документов от производителя'
  },
];

export default function IndustrialSafetyExpertiseTab() {
  const [expertises] = useState<IndustrialSafetyExpertise[]>(mockExpertises);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: IndustrialSafetyExpertise['status']) => {
    const statusConfig = {
      planned: { label: 'Запланировано', variant: 'default' as const, className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      'in-progress': { label: 'В работе', variant: 'default' as const, className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
      completed: { label: 'Завершено', variant: 'default' as const, className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      overdue: { label: 'Просрочено', variant: 'destructive' as const, className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    };
    const config = statusConfig[status];
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const filteredExpertises = expertises.filter(e => {
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    const matchesSearch = e.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.expertiseType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Icon name="ShieldCheck" size={24} className="text-purple-600 dark:text-purple-400" />
              Планирование экспертизы промышленной безопасности
            </h2>
            <p className="text-muted-foreground mt-1">
              График проведения ЭПБ опасных производственных объектов
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Icon name="Plus" size={18} />
                Добавить экспертизу
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Новая экспертиза промышленной безопасности</DialogTitle>
                <DialogDescription>
                  Запланируйте проведение экспертизы промышленной безопасности ОПО
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="facility">Опасный производственный объект</Label>
                  <Select>
                    <SelectTrigger id="facility">
                      <SelectValue placeholder="Выберите ОПО" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">ОПО "Котельная №1"</SelectItem>
                      <SelectItem value="2">ОПО "Газопровод высокого давления"</SelectItem>
                      <SelectItem value="3">ОПО "Резервуарный парк"</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Вид экспертизы</Label>
                  <Select>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Выберите вид экспертизы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Полная ЭПБ</SelectItem>
                      <SelectItem value="project">Проектная документация</SelectItem>
                      <SelectItem value="technical">Технические устройства</SelectItem>
                      <SelectItem value="buildings">Здания и сооружения</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Плановая дата</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Экспертная организация</Label>
                    <Select>
                      <SelectTrigger id="organization">
                        <SelectValue placeholder="Выберите организацию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">ООО "ПромБезопасность"</SelectItem>
                        <SelectItem value="2">АО "Экспертцентр"</SelectItem>
                        <SelectItem value="3">ООО "СпецЭксперт"</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Примечания</Label>
                  <Input id="notes" placeholder="Дополнительная информация" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Отмена</Button>
                <Button>Сохранить</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по объекту или виду экспертизы..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="planned">Запланировано</SelectItem>
              <SelectItem value="in-progress">В работе</SelectItem>
              <SelectItem value="completed">Завершено</SelectItem>
              <SelectItem value="overdue">Просрочено</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredExpertises.map((expertise) => (
            <Card key={expertise.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{expertise.facilityName}</h3>
                    {getStatusBadge(expertise.status)}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="FileCheck" size={16} />
                      <span>{expertise.expertiseType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="Calendar" size={16} />
                      <span>{new Date(expertise.plannedDate).toLocaleDateString('ru-RU')}</span>
                    </div>
                    {expertise.expertOrganization && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="Building2" size={16} />
                        <span>{expertise.expertOrganization}</span>
                      </div>
                    )}
                  </div>
                  {expertise.notes && (
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                      <Icon name="MessageSquare" size={14} />
                      {expertise.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Icon name="Pencil" size={16} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredExpertises.length === 0 && (
          <div className="text-center py-12">
            <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Ничего не найдено</p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Icon name="Calendar" size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expertises.filter(e => e.status === 'planned').length}</p>
              <p className="text-sm text-muted-foreground">Запланировано</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Icon name="Activity" size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expertises.filter(e => e.status === 'in-progress').length}</p>
              <p className="text-sm text-muted-foreground">В работе</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Icon name="CheckCircle" size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expertises.filter(e => e.status === 'completed').length}</p>
              <p className="text-sm text-muted-foreground">Завершено</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <Icon name="AlertCircle" size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expertises.filter(e => e.status === 'overdue').length}</p>
              <p className="text-sm text-muted-foreground">Просрочено</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
