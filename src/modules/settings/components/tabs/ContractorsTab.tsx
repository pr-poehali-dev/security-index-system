import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OrganizationContractor } from '@/types';

interface ContractorsTabProps {
  onAdd: () => void;
  onEdit: (contractor: OrganizationContractor) => void;
  onDelete: (id: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Активный',
  suspended: 'Приостановлен',
  terminated: 'Расторгнут',
};

const TYPE_LABELS: Record<string, string> = {
  training_center: 'Учебный центр',
  contractor: 'Подрядчик',
  supplier: 'Поставщик',
};

const SERVICE_LABELS: Record<string, string> = {
  full_training: 'Полное обучение',
  sdo_access_only: 'Только СДО доступ',
  certification: 'Аттестация',
  consulting: 'Консалтинг',
};

export default function ContractorsTab({ onAdd, onEdit, onDelete }: ContractorsTabProps) {
  const user = useAuthStore((state) => state.user);
  const { getContractorsByTenant } = useSettingsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const contractors = user?.tenantId ? getContractorsByTenant(user.tenantId) : [];

  const filteredContractors = contractors.filter((contractor) => {
    const matchesSearch =
      contractor.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.contractorInn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contractor.status === statusFilter;
    const matchesType = typeFilter === 'all' || contractor.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      suspended: 'secondary',
      terminated: 'destructive',
    };

    return <Badge variant={variants[status]}>{STATUS_LABELS[status]}</Badge>;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Контрагенты</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Управление учебными центрами, подрядчиками и поставщиками
            </p>
          </div>
          <Button onClick={onAdd} className="gap-2">
            <Icon name="Plus" size={16} />
            Добавить контрагента
          </Button>
        </div>

        <div className="flex gap-4 mb-4 flex-wrap">
          <Input
            placeholder="Поиск по названию, ИНН, контактному лицу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="training_center">Учебный центр</SelectItem>
              <SelectItem value="contractor">Подрядчик</SelectItem>
              <SelectItem value="supplier">Поставщик</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активный</SelectItem>
              <SelectItem value="suspended">Приостановлен</SelectItem>
              <SelectItem value="terminated">Расторгнут</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>ИНН</TableHead>
                <TableHead>Услуги</TableHead>
                <TableHead>Договор</TableHead>
                <TableHead>Контактное лицо</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-24">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContractors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    {contractors.length === 0 ? 'Нет контрагентов' : 'Контрагенты не найдены'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredContractors.map((contractor) => (
                  <TableRow key={contractor.id}>
                    <TableCell>
                      <div className="font-medium">{contractor.contractorName}</div>
                      {contractor.contractorTenantId && (
                        <Badge variant="outline" className="text-xs mt-1">
                          <Icon name="Link" size={10} className="mr-1" />
                          В системе
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{TYPE_LABELS[contractor.type]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{contractor.contractorInn || '—'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {contractor.services.map((service) => (
                          <Badge key={service} variant="secondary" className="text-xs">
                            {SERVICE_LABELS[service]}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {contractor.contractNumber ? (
                        <div>
                          <div>{contractor.contractNumber}</div>
                          {contractor.contractDate && (
                            <div className="text-xs text-muted-foreground">
                              от {new Date(contractor.contractDate).toLocaleDateString('ru-RU')}
                            </div>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {contractor.contactPerson || '—'}
                      {contractor.contactPhone && (
                        <div className="text-xs text-muted-foreground">{contractor.contactPhone}</div>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(contractor.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(contractor)}
                        >
                          <Icon name="Pencil" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(contractor.id)}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {filteredContractors.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Показано контрагентов: {filteredContractors.length} из {contractors.length}
          </div>
        )}
      </CardContent>
    </Card>
  );
}