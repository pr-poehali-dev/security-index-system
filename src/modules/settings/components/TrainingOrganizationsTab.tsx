import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useState } from 'react';
import type { TrainingOrganization } from '@/types';
import { exportToExcel } from '@/lib/exportUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TrainingOrganizationsTabProps {
  onAdd: () => void;
  onEdit: (org: TrainingOrganization) => void;
  onDelete: (id: string) => void;
}

export default function TrainingOrganizationsTab({ onAdd, onEdit, onDelete }: TrainingOrganizationsTabProps) {
  const user = useAuthStore((state) => state.user);
  const { trainingOrganizations: allOrgs } = useSettingsStore();
  const [searchTerm, setSearchTerm] = useState('');

  const trainingOrganizations = allOrgs.filter((org) => org.tenantId === user?.tenantId);

  const filteredOrganizations = trainingOrganizations.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.inn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isReadOnly = user?.role !== 'TenantAdmin';

  const handleExport = () => {
    const data = filteredOrganizations.map((org) => ({
      'Название': org.name,
      'ИНН': org.inn || '',
      'Контактное лицо': org.contactPerson || '',
      'Телефон': org.phone || '',
      'Email': org.email || '',
      'Адрес': org.address || '',
      'Сайт': org.website || '',
      'Аккредитации': org.accreditations?.join(', ') || '',
      'Статус': org.status === 'active' ? 'Активен' : 'Неактивен',
      'Дата создания': new Date(org.createdAt).toLocaleDateString('ru-RU')
    }));

    exportToExcel(data, 'Учебные_центры');
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-sm text-muted-foreground">
              Всего записей: {trainingOrganizations.length}
            </p>
            <Input
              placeholder="Поиск по названию, ИНН или контактному лицу..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Icon name="Download" className="mr-2" size={16} />
              Экспорт в Excel
            </Button>
            {!isReadOnly && (
              <Button onClick={onAdd}>
                <Icon name="Plus" className="mr-2" size={16} />
                Добавить учебный центр
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Контактная информация</TableHead>
                  <TableHead>Аккредитации</TableHead>
                  <TableHead>Статус</TableHead>
                  {!isReadOnly && <TableHead className="w-24">Действия</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="font-medium">{org.name}</div>
                      {org.inn && (
                        <div className="text-xs text-muted-foreground">ИНН: {org.inn}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {org.contactPerson && (
                          <div className="flex items-center gap-1">
                            <Icon name="User" size={12} className="text-muted-foreground" />
                            <span>{org.contactPerson}</span>
                          </div>
                        )}
                        {org.phone && (
                          <div className="flex items-center gap-1">
                            <Icon name="Phone" size={12} className="text-muted-foreground" />
                            <span>{org.phone}</span>
                          </div>
                        )}
                        {org.email && (
                          <div className="flex items-center gap-1">
                            <Icon name="Mail" size={12} className="text-muted-foreground" />
                            <span>{org.email}</span>
                          </div>
                        )}
                        {org.website && (
                          <div className="flex items-center gap-1">
                            <Icon name="Globe" size={12} className="text-muted-foreground" />
                            <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {org.website.replace('https://', '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {org.accreditations && org.accreditations.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {org.accreditations.map((acc, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {acc}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={org.status === 'active' ? 'default' : 'secondary'}
                      >
                        {org.status === 'active' ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(org)}
                          >
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(org.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredOrganizations.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Building2" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Учебные центры не найдены</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'Попробуйте изменить параметры поиска' : 'Добавьте первый учебный центр'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Об учебных центрах
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Справочник учебных центров используется в модуле "Аттестация персонала" при планировании обучений.
                  Укажите контактные данные, аккредитации и другую информацию для удобного взаимодействия.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
