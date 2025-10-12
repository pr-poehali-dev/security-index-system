import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ContractorEmployeeObject, AccessStatus, ContractorEmployee, Contractor } from '../../types/contractors';
import type { IndustrialObject, HazardClass } from '@/types/catalog';

interface AccessTableProps {
  filteredAccess: ContractorEmployeeObject[];
  employees: ContractorEmployee[];
  contractors: Contractor[];
  catalogObjects: IndustrialObject[];
  onRevokeClick: (access: ContractorEmployeeObject) => void;
}

const getStatusBadge = (status: AccessStatus) => {
  const variants = {
    active: { variant: 'default' as const, label: 'Активен', icon: 'CheckCircle2' },
    suspended: { variant: 'secondary' as const, label: 'Приостановлен', icon: 'Pause' },
    revoked: { variant: 'destructive' as const, label: 'Отозван', icon: 'XCircle' },
    expired: { variant: 'outline' as const, label: 'Истек', icon: 'Clock' },
  };

  const config = variants[status];
  return (
    <Badge variant={config.variant}>
      <Icon name={config.icon} size={12} className="mr-1" />
      {config.label}
    </Badge>
  );
};

const checkExpiry = (accessEnd?: string) => {
  if (!accessEnd) return null;

  const endDate = new Date(accessEnd);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return { status: 'expired', message: 'Истек', color: 'text-red-600' };
  } else if (daysUntilExpiry <= 7) {
    return {
      status: 'critical',
      message: `${daysUntilExpiry} дн.`,
      color: 'text-red-600',
    };
  } else if (daysUntilExpiry <= 30) {
    return {
      status: 'warning',
      message: `${daysUntilExpiry} дн.`,
      color: 'text-orange-600',
    };
  }
  return { status: 'ok', message: `${daysUntilExpiry} дн.`, color: 'text-green-600' };
};

const getHazardClassLabel = (hazardClass?: HazardClass) => {
  if (!hazardClass) return 'Не указан';
  const labels: Record<HazardClass, string> = {
    'I': 'I (чрезвычайно высокая)',
    'II': 'II (высокая)',
    'III': 'III (средняя)',
    'IV': 'IV (умеренная)',
  };
  return labels[hazardClass];
};

export default function AccessTable({
  filteredAccess,
  employees,
  contractors,
  catalogObjects,
  onRevokeClick,
}: AccessTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Сотрудник</TableHead>
            <TableHead>Объект</TableHead>
            <TableHead>Вид работ</TableHead>
            <TableHead>Период доступа</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Соответствие</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAccess.map((access) => {
            const employee = employees.find((e) => e.id === access.employeeId);
            const object = catalogObjects.find((o) => o.id === access.objectId);
            const expiryCheck = checkExpiry(access.accessEnd);

            return (
              <TableRow key={access.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{employee?.fullName || 'Неизвестно'}</div>
                    <div className="text-sm text-muted-foreground">
                      {employee?.position || '—'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{object?.name || 'Неизвестно'}</div>
                    <div className="text-xs text-muted-foreground">
                      {object?.type === 'opo' && object?.hazardClass
                        ? `Класс опасности: ${getHazardClassLabel(object.hazardClass)}`
                        : object?.type === 'gts'
                        ? 'ГТС'
                        : 'Здание'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {object?.registrationNumber || '—'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{access.workType || '—'}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{new Date(access.accessStart).toLocaleDateString('ru-RU')}</div>
                    {access.accessEnd && (
                      <div className={expiryCheck?.color}>
                        {new Date(access.accessEnd).toLocaleDateString('ru-RU')}
                        {expiryCheck && ` (${expiryCheck.message})`}
                      </div>
                    )}
                    {!access.accessEnd && (
                      <div className="text-muted-foreground">Бессрочно</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(access.accessStatus)}</TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Icon name="CheckCircle2" size={12} className="mr-1" />
                    Соответствует
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRevokeClick(access)}
                      disabled={access.accessStatus === 'revoked'}
                    >
                      <Icon name="Ban" size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
