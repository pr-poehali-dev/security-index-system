import { useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { exportOrganizationsToCSV, downloadCSV, importOrganizationsFromCSV } from '@/lib/exportUtils';
import type { Organization } from '@/types';

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

  const tenantOrgs = getOrganizationsByTenant(user!.tenantId!);
  const tenantDepts = getDepartmentsByTenant(user!.tenantId!);

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
        <p className="text-sm text-muted-foreground">
          Всего организаций: {tenantOrgs.length}
        </p>
        <div className="flex gap-2">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenantOrgs.map((org) => {
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
        })}
      </div>
    </div>
  );
}
