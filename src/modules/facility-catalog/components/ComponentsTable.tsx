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
import { FacilityComponent } from '@/types/facilities';

interface ComponentsTableProps {
  components: FacilityComponent[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const getTechnicalStatusColor = (status: string) => {
  switch (status) {
    case 'operating':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'needs_repair':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'needs_replacement':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'decommissioned':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const getTechnicalStatusLabel = (status: string) => {
  switch (status) {
    case 'operating':
      return 'Действующее';
    case 'needs_repair':
      return 'Требует ремонта';
    case 'needs_replacement':
      return 'Требует замены';
    case 'decommissioned':
      return 'Выведено';
    default:
      return status;
  }
};

const getEquipmentStatusColor = (status: string) => {
  switch (status) {
    case 'working':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'in_repair':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'decommissioned':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const getEquipmentStatusLabel = (status: string) => {
  switch (status) {
    case 'working':
      return 'В работе';
    case 'in_repair':
      return 'В ремонте';
    case 'decommissioned':
      return 'Выведено';
    default:
      return status;
  }
};

export default function ComponentsTable({
  components,
  onEdit,
  onDelete,
}: ComponentsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Тип</TableHead>
            <TableHead>Наименование</TableHead>
            <TableHead>ОПО/ГТС</TableHead>
            <TableHead>Заводской №</TableHead>
            <TableHead>Тех. состояние</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>РТН</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                Компоненты не найдены
              </TableCell>
            </TableRow>
          ) : (
            components.map((component) => (
              <TableRow key={component.id}>
                <TableCell>
                  <Badge variant="outline">
                    {component.type === 'technical_device' ? 'ТУ' : 'ЗС'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-[300px]">
                    <div className="font-medium">{component.fullName}</div>
                    {component.shortName && (
                      <div className="text-xs text-muted-foreground">
                        {component.shortName}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm max-w-[200px] truncate" title={component.facilityName}>
                    {component.facilityName}
                  </div>
                </TableCell>
                <TableCell>
                  {component.factoryNumber ? (
                    <span className="font-mono text-sm">{component.factoryNumber}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getTechnicalStatusColor(component.technicalStatus)}>
                    {getTechnicalStatusLabel(component.technicalStatus)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getEquipmentStatusColor(component.equipmentStatus)}>
                    {getEquipmentStatusLabel(component.equipmentStatus)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {component.registeredInRostechnadzor ? (
                    <Icon name="CheckCircle2" size={16} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <Icon name="XCircle" size={16} className="text-gray-400" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(component.id)}>
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(component.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
