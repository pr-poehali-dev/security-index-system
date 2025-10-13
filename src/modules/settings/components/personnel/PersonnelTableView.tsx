import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface PersonnelTableViewProps {
  personnel: PersonnelWithInfo[];
  onEdit: (person: Personnel) => void;
  onDelete: (id: string) => void;
}

export default function PersonnelTableView({ personnel, onEdit, onDelete }: PersonnelTableViewProps) {
  const {
    organizations,
    externalOrganizations,
    getDepartmentsByTenant,
    getCertificationsByPerson,
    competenciesDirectory
  } = useSettingsStore();

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ФИО</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>Организация</TableHead>
              <TableHead>Подразделение</TableHead>
              <TableHead>Области аттестации</TableHead>
              <TableHead>Контакты</TableHead>
              <TableHead className="text-center">Роль</TableHead>
              <TableHead className="text-center">Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {personnel.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                  <Icon name="Search" size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Сотрудники не найдены</p>
                </TableCell>
              </TableRow>
            ) : (
              personnel.map((person) => {
                const tenantDepts = getDepartmentsByTenant(person.tenantId);
                
                return (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.fullName}</TableCell>
                    <TableCell>{getTypeBadge(person.personnelType)}</TableCell>
                    <TableCell>{person.positionName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {getOrganizationName(person.organizationId, organizations, externalOrganizations)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {person.personnelType === 'employee' 
                          ? getDepartmentName(person.departmentId, tenantDepts) 
                          : '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const certs = getCertificationsByPerson(person.personId);
                        if (certs.length === 0) {
                          return <span className="text-sm text-muted-foreground">—</span>;
                        }
                        return (
                          <div className="flex flex-wrap gap-1">
                            {certs.map((cert) => {
                              const comp = competenciesDirectory.find(c => c.id === cert.competencyId);
                              const isExpired = new Date(cert.expiryDate) < new Date();
                              const isExpiring = !isExpired && new Date(cert.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                              return (
                                <Badge 
                                  key={cert.id} 
                                  variant={isExpired ? 'destructive' : isExpiring ? 'secondary' : 'default'}
                                  className="text-xs"
                                >
                                  {comp?.code || '—'}
                                </Badge>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {person.email && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Icon name="Mail" size={12} />
                            <span className="truncate max-w-[180px]">{person.email}</span>
                          </div>
                        )}
                        {person.phone && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Icon name="Phone" size={12} />
                            <span>{person.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getRoleBadge(person.role)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(person.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onEdit(person)}
                        >
                          <Icon name="Pencil" size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onDelete(person.id)}
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
  );
}
