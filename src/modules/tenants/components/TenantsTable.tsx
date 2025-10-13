import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { MODULES } from '@/lib/constants';
import type { Tenant } from '@/types';

interface TenantsTableProps {
  tenants: Tenant[];
  onEdit: (tenantId: string) => void;
  onShowCredentials: (tenantId: string) => void;
  onToggleStatus: (tenantId: string) => void;
}

export default function TenantsTable({ tenants, onEdit, onShowCredentials, onToggleStatus }: TenantsTableProps) {
  const getDaysUntilExpiry = (expiresAt: string) => {
    return Math.floor((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Организация</TableHead>
            <TableHead>Администратор</TableHead>
            <TableHead>Модули</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Срок действия</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => {
            const daysLeft = getDaysUntilExpiry(tenant.expiresAt);
            const isExpiring = daysLeft <= 30;
            
            return (
              <TableRow key={tenant.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name="Building2" className="text-emerald-600" size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{tenant.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">ИНН: {tenant.inn}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">ID: {tenant.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{tenant.adminName}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{tenant.adminEmail}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {tenant.modules.slice(0, 3).map((moduleKey) => (
                      <Badge key={moduleKey} variant="outline" className="text-xs">
                        {MODULES[moduleKey].name}
                      </Badge>
                    ))}
                    {tenant.modules.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{tenant.modules.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => onToggleStatus(tenant.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      tenant.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    title={tenant.status === 'active' ? 'Деактивировать' : 'Активировать'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        tenant.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </TableCell>
                <TableCell>
                  <div>
                    <div className={`text-sm font-medium ${isExpiring ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
                      {new Date(tenant.expiresAt).toLocaleDateString('ru-RU')}
                    </div>
                    <div className={`text-xs ${isExpiring ? 'text-amber-600' : 'text-gray-600 dark:text-gray-400'}`}>
                      {daysLeft} дней
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(tenant.id)}
                      title="Настроить"
                    >
                      <Icon name="Settings" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onShowCredentials(tenant.id)}
                      title="Учетные данные"
                    >
                      <Icon name="Key" size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}