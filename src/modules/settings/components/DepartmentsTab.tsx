import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { Department } from '@/types';

interface DepartmentsTabProps {
  onAdd: () => void;
  onEdit: (dept: Department) => void;
  onDelete: (id: string) => void;
}

export default function DepartmentsTab({ onAdd, onEdit, onDelete }: DepartmentsTabProps) {
  const user = useAuthStore((state) => state.user);
  const {
    organizations,
    departments,
    personnel,
    getOrganizationsByTenant,
    getDepartmentsByTenant
  } = useSettingsStore();

  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  const tenantOrgs = getOrganizationsByTenant(user!.tenantId!);
  const tenantDepts = getDepartmentsByTenant(user!.tenantId!);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Всего подразделений: {tenantDepts.length}
          </p>
          <select
            className="text-sm border rounded px-3 py-1"
            value={selectedOrg || ''}
            onChange={(e) => setSelectedOrg(e.target.value || null)}
          >
            <option value="">Все организации</option>
            {tenantOrgs.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
        <Button onClick={onAdd} size="sm" className="gap-2">
          <Icon name="Plus" size={14} />
          Добавить подразделение
        </Button>
      </div>

      <div className="grid gap-4">
        {(selectedOrg ? tenantDepts.filter(d => d.organizationId === selectedOrg) : tenantDepts).map((dept) => {
          const org = organizations.find(o => o.id === dept.organizationId);
          const parentDept = departments.find(d => d.id === dept.parentId);
          const deptPersonnel = personnel.filter(p => p.departmentId === dept.id);
          const childDepts = departments.filter(d => d.parentId === dept.id);
          
          return (
            <Card key={dept.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{dept.name}</h3>
                      {dept.code && <Badge variant="outline">{dept.code}</Badge>}
                      <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                        {dept.status === 'active' ? 'Активно' : 'Неактивно'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {org && (
                        <div className="flex items-center gap-2">
                          <Icon name="Building2" size={14} />
                          <span>{org.name}</span>
                        </div>
                      )}
                      {parentDept && (
                        <div className="flex items-center gap-2">
                          <Icon name="ArrowRight" size={14} />
                          <span>Входит в: {parentDept.name}</span>
                        </div>
                      )}
                      {dept.head && (
                        <div className="flex items-center gap-2">
                          <Icon name="User" size={14} />
                          <span>Рук.: {dept.head}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Icon name="Users" size={14} />
                        <span>Персонал: {deptPersonnel.length}</span>
                      </div>
                      {childDepts.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Icon name="Building" size={14} />
                          <span>Подчиненных подразделений: {childDepts.length}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(dept)}
                    >
                      <Icon name="Pencil" size={14} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDelete(dept.id)}
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
