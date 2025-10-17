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
import { Facility } from '@/types/facilities';
import { Organization } from '@/types';
import { useFacilitiesStore } from '@/stores/facilitiesStore';

interface FacilityTableViewProps {
  organizations: Organization[];
  facilities: Facility[];
  onEdit: (facility: Facility) => void;
  onEditComponent: (componentId: string) => void;
  onDelete: (facilityId: string) => void;
  onDeleteComponent: (componentId: string) => void;
}

const getHazardClassColor = (hazardClass?: string) => {
  switch (hazardClass) {
    case 'I':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'II':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'III':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'IV':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const getTypeIcon = (type: 'opo' | 'tu' | 'zs') => {
  switch (type) {
    case 'opo':
      return <Icon name="Factory" size={16} className="text-orange-600" />;
    case 'tu':
      return <Icon name="Cpu" size={16} className="text-purple-600" />;
    case 'zs':
      return <Icon name="Building" size={16} className="text-green-600" />;
  }
};

const getTypeLabel = (type: 'opo' | 'tu' | 'zs') => {
  switch (type) {
    case 'opo':
      return 'ОПО';
    case 'tu':
      return 'ТУ';
    case 'zs':
      return 'ЗС';
  }
};

export default function FacilityTableView({
  organizations,
  facilities,
  onEdit,
  onEditComponent,
  onDelete,
  onDeleteComponent,
}: FacilityTableViewProps) {
  const { getComponentsByTenant } = useFacilitiesStore();
  
  const allComponents = getComponentsByTenant(facilities[0]?.tenantId || '');

  const tableData: Array<{
    id: string;
    type: 'opo' | 'tu' | 'zs';
    name: string;
    organization: string;
    parentOpo?: string;
    hazardClass?: string;
    registrationNumber?: string;
    isComponent: boolean;
  }> = [];

  facilities.forEach((facility) => {
    const org = organizations.find(o => o.id === facility.organizationId);
    
    tableData.push({
      id: facility.id,
      type: 'opo',
      name: facility.fullName,
      organization: org?.name || facility.organizationName,
      hazardClass: facility.hazardClass,
      registrationNumber: facility.registrationNumber,
      isComponent: false,
    });

    const components = allComponents.filter(c => c.facilityId === facility.id);
    components.forEach((component) => {
      tableData.push({
        id: component.id,
        type: component.type === 'technical_device' ? 'tu' : 'zs',
        name: component.fullName,
        organization: org?.name || facility.organizationName,
        parentOpo: facility.fullName,
        registrationNumber: component.internalRegistrationNumber,
        isComponent: true,
      });
    });
  });

  if (tableData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Объекты не найдены
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Тип</TableHead>
            <TableHead>Наименование</TableHead>
            <TableHead>Организация</TableHead>
            <TableHead>Родительский ОПО</TableHead>
            <TableHead>Класс опасности</TableHead>
            <TableHead>Рег. номер</TableHead>
            <TableHead className="text-right w-[100px]">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.type)}
                  <span className="text-xs font-medium">{getTypeLabel(item.type)}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {item.organization}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {item.parentOpo || '—'}
              </TableCell>
              <TableCell>
                {item.hazardClass ? (
                  <Badge className={`${getHazardClassColor(item.hazardClass)} text-xs`}>
                    {item.hazardClass}
                  </Badge>
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell className="text-sm">
                {item.registrationNumber || '—'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-1 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      if (item.isComponent) {
                        onEditComponent(item.id);
                      } else {
                        const facility = facilities.find(f => f.id === item.id);
                        if (facility) onEdit(facility);
                      }
                    }}
                  >
                    <Icon name="Pencil" size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      if (item.isComponent) {
                        onDeleteComponent(item.id);
                      } else {
                        onDelete(item.id);
                      }
                    }}
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
