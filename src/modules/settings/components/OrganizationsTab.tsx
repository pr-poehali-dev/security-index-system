import { useRef, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { exportOrganizationsToCSV, downloadCSV, importOrganizationsFromCSV } from '@/lib/exportUtils';
import type { Organization } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface OrganizationsTabProps {
  onAdd: () => void;
  onEdit: (org: Organization) => void;
  onDelete: (id: string) => void;
}

export default function OrganizationsTab({ onAdd, onEdit, onDelete }: OrganizationsTabProps) {
  const user = useAuthStore((state) => state.user);
  const {
    personnel,
    getOrganizationsByTenant,
    getDepartmentsByTenant,
    getDepartmentsByOrganization,
    importOrganizations,
    importDepartments
  } = useSettingsStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const tenantOrgs = getOrganizationsByTenant(user!.tenantId!);
  const tenantDepts = getDepartmentsByTenant(user!.tenantId!);

  const filteredOrgs = tenantOrgs.filter((org) =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.inn.includes(searchTerm) ||
    org.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const csv = exportOrganizationsToCSV(tenantOrgs, tenantDepts);
    downloadCSV(csv, `organizations_${new Date().toISOString().split('T')[0]}.csv`);
    toast({ title: 'Экспорт завершен', description: 'Файл организаций загружен' });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { organizations: orgs, departments: depts } = await importOrganizationsFromCSV(file, user!.tenantId!);
      importOrganizations(orgs);
      importDepartments(depts);
      toast({ title: 'Импорт завершен', description: `Добавлено: ${orgs.length} организаций, ${depts.length} подразделений` });
    } catch (error) {
      toast({ title: 'Ошибка импорта', description: 'Проверьте формат файла', variant: 'destructive' });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Всего: {tenantOrgs.length}
          </p>
          <Input
            placeholder="Поиск по названию, ИНН, адресу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-r-none"
            >
              <Icon name="Table" size={16} />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-l-none"
            >
              <Icon name="LayoutGrid" size={16} />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Icon name="Download" size={14} />
            Экспорт
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Icon name="Upload" size={14} />
            Импорт
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          <Button onClick={onAdd} size="sm" className="gap-2">
            <Icon name="Plus" size={14} />
            Добавить
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>ИНН / КПП</TableHead>
                <TableHead>Адрес</TableHead>
                <TableHead className="text-center">Подразделений</TableHead>
                <TableHead className="text-center">Персонал</TableHead>
                <TableHead className="text-center">Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrgs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <Icon name="Search" size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Организации не найдены</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrgs.map((org) => {
                  const orgDepts = getDepartmentsByOrganization(org.id);
                  const orgPersonnel = personnel.filter(p => p.organizationId === org.id);
                  
                  return (
                    <TableRow key={org.id}>
                      <TableCell className="font-medium">{org.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>ИНН: {org.inn}</div>
                          {org.kpp && <div className="text-muted-foreground">КПП: {org.kpp}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs truncate">
                          {org.address || '—'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{orgDepts.length}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{orgPersonnel.length}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                          {org.status === 'active' ? 'Активна' : 'Неактивна'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onEdit(org)}
                          >
                            <Icon name="Pencil" size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onDelete(org.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrgs.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Icon name="Search" size={48} className="mx-auto mb-4 opacity-20" />
              <p>Организации не найдены</p>
            </div>
          ) : (
            filteredOrgs.map((org) => {
              const orgDepts = getDepartmentsByOrganization(org.id);
              const orgPersonnel = personnel.filter(p => p.organizationId === org.id);
              
              return (
                <Card key={org.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <CardDescription className="mt-1">
                          ИНН: {org.inn} {org.kpp && `• КПП: ${org.kpp}`}
                        </CardDescription>
                      </div>
                      <Badge variant={org.status === 'active' ? 'default' : 'secondary'}>
                        {org.status === 'active' ? 'Активна' : 'Неактивна'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {org.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Icon name="MapPin" size={14} className="mt-0.5" />
                        <span className="flex-1">{org.address}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Icon name="Building" size={14} />
                        <span>Подразделений: {orgDepts.length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Users" size={14} />
                        <span>Персонал: {orgPersonnel.length}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => onEdit(org)}
                      >
                        <Icon name="Pencil" size={14} />
                        Изменить
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onDelete(org.id)}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}