import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import type { Position } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PositionsDirectoryTabProps {
  onAdd: () => void;
  onEdit: (position: Position) => void;
  onDelete: (id: string) => void;
}

const categoryLabels = {
  management: 'Руководство',
  specialist: 'Специалист',
  worker: 'Рабочий',
  other: 'Другое'
};

export default function PositionsDirectoryTab({ onAdd, onEdit, onDelete }: PositionsDirectoryTabProps) {
  const user = useAuthStore((state) => state.user);
  const { getPositionsByTenant } = useSettingsStore();
  const [searchTerm, setSearchTerm] = useState('');

  const positions = user?.tenantId ? getPositionsByTenant(user.tenantId) : [];

  const filteredPositions = positions.filter((position) => {
    const searchLower = searchTerm.toLowerCase();
    return position.name.toLowerCase().includes(searchLower) ||
           position.code?.toLowerCase().includes(searchLower) ||
           position.description?.toLowerCase().includes(searchLower);
  });

  const isReadOnly = user?.role !== 'TenantAdmin';

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Справочник должностей</h3>
              <p className="text-sm text-muted-foreground">
                Перечень должностей с категориями и описаниями
              </p>
            </div>
            {!isReadOnly && (
              <Button onClick={onAdd}>
                <Icon name="Plus" size={16} />
                Добавить должность
              </Button>
            )}
          </div>

          <div className="mb-4">
            <Input
              placeholder="Поиск по названию, коду, описанию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Код</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Статус</TableHead>
                  {!isReadOnly && <TableHead className="w-[100px]">Действия</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isReadOnly ? 5 : 6} className="text-center text-muted-foreground py-8">
                      Нет данных
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPositions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell className="font-medium">{position.name}</TableCell>
                      <TableCell>
                        {position.code && (
                          <Badge variant="outline">{position.code}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {position.category && (
                          <Badge variant="secondary">
                            {categoryLabels[position.category]}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-md truncate">
                          {position.description || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={position.status === 'active' ? 'default' : 'secondary'}>
                          {position.status === 'active' ? 'Активна' : 'Неактивна'}
                        </Badge>
                      </TableCell>
                      {!isReadOnly && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(position)}
                            >
                              <Icon name="Edit" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(position.id)}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Всего записей: {filteredPositions.length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                О справочнике должностей
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Справочник содержит перечень должностей организации. 
                Должности связываются с людьми через модуль "Персонал".
                Используется для определения требований к компетенциям и аттестации.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
