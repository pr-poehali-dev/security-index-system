import { useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { exportPersonnelToCSV, downloadCSV, importPersonnelFromCSV } from '@/lib/exportUtils';
import type { Personnel } from '@/types';

interface PersonnelTabProps {
  onAdd: () => void;
  onEdit: (person: Personnel) => void;
  onDelete: (id: string) => void;
}

export default function PersonnelTab({ onAdd, onEdit, onDelete }: PersonnelTabProps) {
  const user = useAuthStore((state) => state.user);
  const {
    organizations,
    getDepartmentsByTenant,
    getPersonnelByTenant,
    importPersonnel
  } = useSettingsStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tenantDepts = getDepartmentsByTenant(user!.tenantId!);
  const tenantPersonnel = getPersonnelByTenant(user!.tenantId!);

  const handleExport = () => {
    const csv = exportPersonnelToCSV(tenantPersonnel, organizations, tenantDepts);
    downloadCSV(csv, `personnel_${new Date().toISOString().split('T')[0]}.csv`);
    toast({ title: 'Экспорт завершен', description: 'Файл персонала загружен' });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const people = await importPersonnelFromCSV(file, user!.tenantId!, organizations, tenantDepts);
      importPersonnel(people);
      toast({ title: 'Импорт завершен', description: `Добавлено сотрудников: ${people.length}` });
    } catch (error) {
      toast({ title: 'Ошибка импорта', description: 'Проверьте формат файла', variant: 'destructive' });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getRoleBadge = (role: Personnel['role']) => {
    const variants = {
      Auditor: 'default',
      Manager: 'secondary',
      Director: 'destructive'
    } as const;
    
    const labels = {
      Auditor: 'Аудитор',
      Manager: 'Менеджер',
      Director: 'Директор'
    };

    return <Badge variant={variants[role]}>{labels[role]}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <p className="text-sm text-muted-foreground">
          Всего сотрудников: {tenantPersonnel.length} (действующих: {tenantPersonnel.filter(p => p.status === 'active').length})
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
            <Icon name="UserPlus" size={14} />
            Добавить
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {tenantPersonnel.map((person) => {
          const org = organizations.find(o => o.id === person.organizationId);
          const dept = tenantDepts.find(d => d.id === person.departmentId);
          
          return (
            <Card key={person.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-lg">{person.fullName}</h3>
                        {getRoleBadge(person.role)}
                        <Badge variant={person.status === 'active' ? 'default' : 'secondary'}>
                          {person.status === 'active' ? 'Действующий' : 'Уволен'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{person.position}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {org && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Icon name="Building2" size={14} />
                          <span>{org.name}</span>
                        </div>
                      )}
                      {dept && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Icon name="Building" size={14} />
                          <span>{dept.name}</span>
                        </div>
                      )}
                      {person.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Icon name="Mail" size={14} />
                          <span>{person.email}</span>
                        </div>
                      )}
                      {person.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Icon name="Phone" size={14} />
                          <span>{person.phone}</span>
                        </div>
                      )}
                      {person.hireDate && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Icon name="Calendar" size={14} />
                          <span>Принят: {new Date(person.hireDate).toLocaleDateString('ru-RU')}</span>
                        </div>
                      )}
                      {person.dismissalDate && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Icon name="CalendarX" size={14} />
                          <span>Уволен: {new Date(person.dismissalDate).toLocaleDateString('ru-RU')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(person)}
                    >
                      <Icon name="Pencil" size={14} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDelete(person.id)}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
