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
import type { Person } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PeopleDirectoryTabProps {
  onAdd: () => void;
  onEdit: (person: Person) => void;
  onDelete: (id: string) => void;
}

interface PersonImportRow {
  'Фамилия': string;
  'Имя': string;
  'Отчество'?: string;
  'Дата рождения'?: string;
  'СНИЛС'?: string;
  'ИНН'?: string;
  'Email'?: string;
  'Телефон'?: string;
  'Адрес'?: string;
  'Образование'?: string;
  'Статус'?: string;
}

export default function PeopleDirectoryTab({ onAdd, onEdit, onDelete }: PeopleDirectoryTabProps) {
  const user = useAuthStore((state) => state.user);
  const allPeople = useSettingsStore((state) => state.people);
  const importPeople = useSettingsStore((state) => state.importPeople);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const people = useMemo(() => 
    user?.tenantId ? allPeople.filter(p => p.tenantId === user.tenantId) : []
  , [allPeople, user?.tenantId]);

  const filteredPeople = people.filter((person) => {
    const fullName = `${person.lastName} ${person.firstName} ${person.middleName || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) ||
           person.email?.toLowerCase().includes(searchLower) ||
           person.phone?.includes(searchTerm);
  });

  const isReadOnly = user?.role !== 'TenantAdmin';

  const getFullName = (person: Person) => {
    return `${person.lastName} ${person.firstName} ${person.middleName || ''}`.trim();
  };

  const handleExport = () => {
    const exportData = filteredPeople.map(person => ({
      'Фамилия': person.lastName,
      'Имя': person.firstName,
      'Отчество': person.middleName || '',
      'Дата рождения': person.birthDate || '',
      'СНИЛС': person.snils || '',
      'ИНН': person.inn || '',
      'Email': person.email || '',
      'Телефон': person.phone || '',
      'Адрес': person.address || '',
      'Образование': person.educationLevel || '',
      'Статус': person.status === 'active' ? 'Активный' : 'Неактивный'
    }));
    exportToExcel(exportData, 'Справочник_людей');
    toast({ title: 'Экспорт завершен', description: `Экспортировано: ${exportData.length} записей` });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<PersonImportRow>(worksheet);

      if (jsonData.length === 0) {
        throw new Error('Файл пустой');
      }

      const peopleToImport = jsonData.map(row => ({
        tenantId: user.tenantId!,
        lastName: row['Фамилия'] || '',
        firstName: row['Имя'] || '',
        middleName: row['Отчество'] || undefined,
        birthDate: row['Дата рождения'] || undefined,
        snils: row['СНИЛС'] || undefined,
        inn: row['ИНН'] || undefined,
        email: row['Email'] || undefined,
        phone: row['Телефон'] || undefined,
        address: row['Адрес'] || undefined,
        educationLevel: row['Образование'] as Person['educationLevel'] || undefined,
        status: (row['Статус']?.toLowerCase().includes('актив') ? 'active' : 'inactive') as Person['status']
      }));

      importPeople(peopleToImport);
      toast({ title: 'Импорт завершен', description: `Добавлено: ${peopleToImport.length} человек` });
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
              <h3 className="text-lg font-semibold">Справочник людей</h3>
              <p className="text-sm text-muted-foreground">
                Базовая информация о людях (ФИО, контакты, документы)
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
                  Добавить человека
                </Button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <Input
              placeholder="Поиск по ФИО, email, телефону..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Документы</TableHead>
                  <TableHead>Статус</TableHead>
                  {!isReadOnly && <TableHead className="w-[100px]">Действия</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPeople.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isReadOnly ? 4 : 5} className="text-center text-muted-foreground py-8">
                      Нет данных
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPeople.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getFullName(person)}</div>
                          {person.birthDate && (
                            <div className="text-sm text-muted-foreground">
                              Дата рождения: {new Date(person.birthDate).toLocaleDateString('ru-RU')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {person.email && (
                            <div className="text-sm flex items-center gap-1">
                              <Icon name="Mail" size={14} className="text-muted-foreground" />
                              {person.email}
                            </div>
                          )}
                          {person.phone && (
                            <div className="text-sm flex items-center gap-1">
                              <Icon name="Phone" size={14} className="text-muted-foreground" />
                              {person.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {person.passportSeries && person.passportNumber && (
                            <div>Паспорт: {person.passportSeries} {person.passportNumber}</div>
                          )}
                          {person.inn && <div>ИНН: {person.inn}</div>}
                          {person.snils && <div>СНИЛС: {person.snils}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={person.status === 'active' ? 'default' : 'secondary'}>
                          {person.status === 'active' ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </TableCell>
                      {!isReadOnly && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(person)}
                            >
                              <Icon name="Edit" size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(person.id)}
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
            Всего записей: {filteredPeople.length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                О справочнике людей
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Справочник содержит базовую информацию о людях (ФИО, контакты, документы). 
                Один человек может занимать несколько должностей в разных организациях.
                Данные используются в модулях "Персонал", "Аттестация" и других.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}