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
import { Organization } from '@/types/facilities';

interface OrganizationsTableProps {
  organizations: Organization[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function OrganizationsTable({
  organizations,
  onEdit,
  onDelete,
}: OrganizationsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Наименование</TableHead>
            <TableHead>ИНН</TableHead>
            <TableHead>КПП</TableHead>
            <TableHead>ОГРН</TableHead>
            <TableHead>Руководитель</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Организации не найдены
              </TableCell>
            </TableRow>
          ) : (
            organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{org.fullName}</div>
                    {org.shortName && (
                      <div className="text-xs text-muted-foreground">
                        {org.shortName}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{org.inn}</TableCell>
                <TableCell className="font-mono text-sm">{org.kpp || '—'}</TableCell>
                <TableCell className="font-mono text-sm">{org.ogrn || '—'}</TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">{org.headFullName}</div>
                    <div className="text-xs text-muted-foreground">
                      {org.headPosition}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {org.isActive ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Активна
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                      Неактивна
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(org.id)}>
                      <Icon name="Pencil" size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(org.id)}
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
