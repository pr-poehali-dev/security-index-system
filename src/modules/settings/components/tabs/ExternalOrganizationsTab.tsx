import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useState, useRef } from 'react';
import type { ExternalOrganization, ExternalOrganizationType } from '@/types';
import { exportToExcel } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ExternalOrganizationsTabProps {
  onAdd: () => void;
  onEdit: (org: ExternalOrganization) => void;
  onDelete: (id: string) => void;
  onCreateContractor?: (org: ExternalOrganization) => void;
}

const ORGANIZATION_TYPES: { value: ExternalOrganizationType; label: string; icon: string }[] = [
  { value: 'training_center', label: 'Учебный центр', icon: 'GraduationCap' },
  { value: 'contractor', label: 'Подрядчик', icon: 'Wrench' },
  { value: 'supplier', label: 'Поставщик', icon: 'Package' },
  { value: 'regulatory_body', label: 'Надзорный орган', icon: 'Shield' },
  { value: 'certification_body', label: 'Орган сертификации', icon: 'Award' },
  { value: 'other', label: 'Другое', icon: 'Building2' },
];

export default function ExternalOrganizationsTab({ onAdd, onEdit, onDelete, onCreateContractor }: ExternalOrganizationsTabProps) {
  const user = useAuthStore((state) => state.user);
  const { externalOrganizations: allOrgs, importExternalOrganizations } = useSettingsStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const externalOrganizations = allOrgs.filter((org) => org.tenantId === user?.tenantId);

  const filteredOrganizations = externalOrganizations.filter((org) => {
    const matchesSearch = 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.inn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || org.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const isReadOnly = user?.role !== 'TenantAdmin';

  const getTypeLabel = (type: ExternalOrganizationType) => {
    return ORGANIZATION_TYPES.find(t => t.value === type)?.label || type;
  };

  const getTypeIcon = (type: ExternalOrganizationType) => {
    return ORGANIZATION_TYPES.find(t => t.value === type)?.icon || 'Building2';
  };

  const handleExport = () => {
    const data = filteredOrganizations.map((org) => ({
      'Тип': getTypeLabel(org.type),
      'Название': org.name,
      'ИНН': org.inn || '',
      'КПП': org.kpp || '',
      'Контактное лицо': org.contactPerson || '',
      'Телефон': org.phone || '',
      'Email': org.email || '',
      'Адрес': org.address || '',
      'Сайт': org.website || '',
      'Аккредитации': org.accreditations?.join(', ') || '',
      'Описание': org.description || '',
      'Статус': org.status === 'active' ? 'Активен' : 'Неактивен'
    }));

    exportToExcel(data, 'Сторонние_организации');
    toast({ title: 'Экспорт завершен', description: `Экспортировано: ${data.length} записей` });
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

      const typeMap: Record<string, ExternalOrganizationType> = {};
      ORGANIZATION_TYPES.forEach(t => {
        typeMap[t.label] = t.value;
      });

      const orgsToImport = jsonData.map(row => ({
        tenantId: user.tenantId!,
        type: typeMap[row['Тип']] || 'other',
        name: row['Название'] || '',
        inn: row['ИНН'] || undefined,
        kpp: row['КПП'] || undefined,
        contactPerson: row['Контактное лицо'] || undefined,
        phone: row['Телефон'] || undefined,
        email: row['Email'] || undefined,
        address: row['Адрес'] || undefined,
        website: row['Сайт'] || undefined,
        accreditations: row['Аккредитации']?.split(',').map((s: string) => s.trim()).filter(Boolean) || undefined,
        description: row['Описание'] || undefined,
        status: (row['Статус']?.toLowerCase().includes('актив') ? 'active' : 'inactive') as 'active' | 'inactive'
      }));

      importExternalOrganizations(orgsToImport);
      toast({ title: 'Импорт завершен', description: `Добавлено: ${orgsToImport.length} организаций` });
    } catch (error) {
      toast({ title: 'Ошибка импорта', description: 'Проверьте формат файла', variant: 'destructive' });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const typeStats = ORGANIZATION_TYPES.map(type => ({
    ...type,
    count: externalOrganizations.filter(org => org.type === type.value).length
  }));

  return (
    <>
      <div className="space-y-4">
        {!isReadOnly && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Быстрое создание контрагентов</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Для учебных центров, подрядчиков и поставщиков доступна кнопка <Icon name="FileSignature" size={12} className="inline" /> — она создаст контрагента с автозаполнением данных из этой организации.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {typeStats.map((type) => (
            <Card 
              key={type.value}
              className={`cursor-pointer transition-all hover:shadow-md ${
                typeFilter === type.value ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setTypeFilter(typeFilter === type.value ? 'all' : type.value)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Icon name={type.icon as any} size={18} className="text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{type.label}</p>
                    <p className="text-lg font-bold">{type.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-sm text-muted-foreground">
              Всего записей: {filteredOrganizations.length} из {externalOrganizations.length}
            </p>
            <Input
              placeholder="Поиск по названию, ИНН или контактному лицу..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Тип организации" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                {ORGANIZATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Icon name="Download" size={14} />
              Экспорт
            </Button>
            {!isReadOnly && (
              <>
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
                <Button onClick={onAdd} size="sm">
                  <Icon name="Plus" size={16} />
                  Добавить организацию
                </Button>
              </>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Тип</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Контактная информация</TableHead>
                  <TableHead>Дополнительно</TableHead>
                  <TableHead>Статус</TableHead>
                  {!isReadOnly && <TableHead className="w-32">Действия</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon name={getTypeIcon(org.type) as any} size={16} className="text-muted-foreground" />
                        <span className="text-sm">{getTypeLabel(org.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{org.name}</div>
                      {org.inn && (
                        <div className="text-xs text-muted-foreground">
                          ИНН: {org.inn}{org.kpp && ` / КПП: ${org.kpp}`}
                        </div>
                      )}
                      {org.description && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {org.description}
                        </div>
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
                            <span className="truncate max-w-[200px]">{org.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {org.website && (
                          <div className="flex items-center gap-1 text-sm">
                            <Icon name="Globe" size={12} className="text-muted-foreground" />
                            <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[150px]">
                              {org.website.replace('https://', '')}
                            </a>
                          </div>
                        )}
                        {org.accreditations && org.accreditations.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {org.accreditations.map((acc, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {acc}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
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
                        <TooltipProvider>
                          <div className="flex gap-1">
                            {(org.type === 'training_center' || org.type === 'contractor' || org.type === 'supplier') && onCreateContractor && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onCreateContractor(org)}
                                    className="gap-1"
                                  >
                                    <Icon name="FileSignature" size={14} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Создать контрагента на основе этой организации</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
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
                        </TooltipProvider>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredOrganizations.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Building2" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Организации не найдены</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || typeFilter !== 'all' 
                    ? 'Попробуйте изменить параметры поиска или фильтры' 
                    : 'Добавьте первую стороннюю организацию'}
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
                  О сторонних организациях
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Справочник сторонних организаций используется в различных модулях системы:
                  учебные центры — в модуле "Аттестация персонала", подрядчики и поставщики — в модуле "Инциденты" и других.
                  Централизованное управление позволяет избежать дублирования данных.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}