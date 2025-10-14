import { useState, useRef, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/lib/exportUtils';
import * as XLSX from 'xlsx';
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
  const allPositions = useSettingsStore((state) => state.positions);
  const importPositions = useSettingsStore((state) => state.importPositions);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const positions = useMemo(() => 
    user?.tenantId ? allPositions.filter(p => p.tenantId === user.tenantId) : []
  , [allPositions, user?.tenantId]);

  const filteredPositions = positions.filter((position) => {
    const searchLower = searchTerm.toLowerCase();
    return position.name.toLowerCase().includes(searchLower) ||
           position.code?.toLowerCase().includes(searchLower) ||
           position.description?.toLowerCase().includes(searchLower);
  });

  const isReadOnly = user?.role !== 'TenantAdmin';

  const handleExport = () => {
    const exportData = filteredPositions.map(pos => ({
      'Название': pos.name,
      'Код': pos.code || '',
      'Категория': categoryLabels[pos.category],
      'Описание': pos.description || '',
      'Статус': pos.status === 'active' ? 'Активная' : 'Неактивная'
    }));
    exportToExcel(exportData, 'Справочник_должностей');
    toast({ title: 'Экспорт завершен', description: `Экспортировано: ${exportData.length} должностей` });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      if (jsonData.length === 0) {
        throw new Error('Файл пустой');
      }

      const categoryMap: Record<string, Position['category']> = {
        'Руководство': 'management',
        'Специалист': 'specialist',
        'Рабочий': 'worker',
        'Другое': 'other'
      };

      const positionsToImport = jsonData.map(row => ({
        tenantId: user.tenantId!,
        name: row['Название'] || '',
        code: row['Код'] || undefined,
        category: categoryMap[row['Категория']] || 'other',
        description: row['Описание'] || undefined,
        status: (row['Статус']?.toLowerCase().includes('актив') ? 'active' : 'inactive') as Position['status']
      }));

      importPositions(positionsToImport);
      toast({ title: 'Импорт завершен', description: `Добавлено: ${positionsToImport.length} должностей` });
    } catch (error) {
      toast({ title: 'Ошибка импорта', description: 'Проверьте формат файла', variant: 'destructive' });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Icon name="Download" size={14} />
                  Экспорт
                </Button>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Icon name="Upload" size={14} />
                  Импорт
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button onClick={onAdd}>
                  <Icon name="Plus" size={16} />
                  Добавить должность
                </Button>
              </div>
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