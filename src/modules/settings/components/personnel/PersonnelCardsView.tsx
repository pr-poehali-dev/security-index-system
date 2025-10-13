import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useSettingsStore } from '@/stores/settingsStore';
import { getRoleBadge, getTypeBadge, getStatusBadge } from '../../utils/personnelBadges';
import { getOrganizationName, getDepartmentName } from '../../utils/personnelHelpers';
import type { Personnel } from '@/types';

interface PersonnelWithInfo extends Personnel {
  fullName: string;
  positionName: string;
  email?: string;
  phone?: string;
}

interface PersonnelCardsViewProps {
  personnel: PersonnelWithInfo[];
  onEdit: (person: Personnel) => void;
  onDelete: (id: string) => void;
}

export default function PersonnelCardsView({ personnel, onEdit, onDelete }: PersonnelCardsViewProps) {
  const { organizations, externalOrganizations, getDepartmentsByTenant } = useSettingsStore();

  if (personnel.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-muted-foreground">
        <Icon name="Search" size={48} className="mx-auto mb-4 opacity-20" />
        <p>Сотрудники не найдены</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {personnel.map((person) => {
        const tenantDepts = getDepartmentsByTenant(person.tenantId);
        
        return (
          <Card key={person.id}>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{person.fullName}</h3>
                    {getTypeBadge(person.personnelType)}
                  </div>
                  <p className="text-sm text-muted-foreground">{person.positionName}</p>
                </div>
                {getStatusBadge(person.status)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon name="Building2" size={14} />
                  <span>
                    {getOrganizationName(person.organizationId, organizations, externalOrganizations)}
                  </span>
                </div>
                {person.personnelType === 'employee' && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Building" size={14} />
                    <span>{getDepartmentName(person.departmentId, tenantDepts)}</span>
                  </div>
                )}
                {person.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Mail" size={14} />
                    <span className="truncate">{person.email}</span>
                  </div>
                )}
                {person.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Phone" size={14} />
                    <span>{person.phone}</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                {getRoleBadge(person.role)}
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={() => onEdit(person)}
                >
                  <Icon name="Pencil" size={14} />
                  Изменить
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDelete(person.id)}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
