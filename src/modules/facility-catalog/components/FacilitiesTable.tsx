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

interface FacilitiesTableProps {
  facilities: Facility[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
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

export default function FacilitiesTable({
  facilities,
  onEdit,
  onDelete,
}: FacilitiesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Тип</TableHead>
            <TableHead>Наименование</TableHead>
            <TableHead>Организация</TableHead>
            <TableHead>Рег. номер</TableHead>
            <TableHead>Класс опасности</TableHead>
            <TableHead>Адрес</TableHead>
            <TableHead>Ответственный</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facilities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                Объекты не найдены
              </TableCell>
            </TableRow>
          ) : (
            facilities.map((facility) => (
              <TableRow key={facility.id}>
                <TableCell>
                  <Badge variant="outline">
                    {facility.type === 'opo' ? 'ОПО' : 'ГТС'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-[300px]">
                    <div className="font-medium">{facility.fullName}</div>
                    {facility.typicalName && (
                      <div className="text-xs text-muted-foreground">
                        {facility.typicalName}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{facility.organizationName}</div>
                </TableCell>
                <TableCell>
                  {facility.registrationNumber ? (
                    <span className="font-mono text-sm">{facility.registrationNumber}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {facility.hazardClass ? (
                    <Badge className={getHazardClassColor(facility.hazardClass)}>
                      {facility.hazardClass} класс
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm max-w-[200px] truncate" title={facility.address}>
                    {facility.address}
                  </div>
                </TableCell>
                <TableCell>
                  {facility.responsiblePersonName ? (
                    <div className="text-sm">{facility.responsiblePersonName}</div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(facility.id)}>
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(facility.id)}
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
