import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { useAttestationOrdersStore } from '@/stores/attestationOrdersStore';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import CreateAttestationOrderDialog from './CreateAttestationOrderDialog';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const statusLabels = {
  draft: 'Черновик',
  pending: 'Ожидает утверждения',
  scheduled: 'Запланирована',
  completed: 'Завершена',
  cancelled: 'Отменена'
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const typeLabels = {
  rostekhnadzor: 'Ростехнадзор',
  internal_commission: 'Комиссия организации'
};

export default function AttestationOrdersList() {
  const user = useAuthStore((state) => state.user);
  const { orders, getOrdersByTenant } = useAttestationOrdersStore();
  const { organizations } = useSettingsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const userOrders = user?.tenantId ? getOrdersByTenant(user.tenantId) : [];

  const filteredOrders = userOrders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.certificationAreaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.certificationAreaCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="FileText" size={24} />
                Приказы на аттестацию
              </CardTitle>
              <CardDescription>
                Создание и управление приказами для направления на аттестацию
              </CardDescription>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Icon name="Plus" size={18} />
              Создать приказ
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по номеру приказа или области аттестации..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Нет приказов на аттестацию</h3>
              <p className="text-muted-foreground mb-4">
                Создайте первый приказ для направления сотрудников на аттестацию
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Icon name="Plus" size={18} />
                Создать приказ
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер приказа</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Организация</TableHead>
                    <TableHead>Область аттестации</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Сотрудников</TableHead>
                    <TableHead>Плановая дата</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const organization = organizations.find(o => o.id === order.organizationId);
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(order.orderDate), 'dd.MM.yyyy', { locale: ru })}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">
                            {organization?.name || 'Не указана'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.certificationAreaCode}</div>
                            <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                              {order.certificationAreaName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {typeLabels[order.attestationType]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Icon name="Users" size={14} className="text-muted-foreground" />
                            <span>{order.personnel.length}</span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {order.scheduledDate 
                            ? format(new Date(order.scheduledDate), 'dd.MM.yyyy', { locale: ru })
                            : '—'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Icon name="Eye" size={16} />
                              Просмотр
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Icon name="Download" size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredOrders.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Всего приказов: <span className="font-medium">{filteredOrders.length}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAttestationOrderDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </>
  );
}
