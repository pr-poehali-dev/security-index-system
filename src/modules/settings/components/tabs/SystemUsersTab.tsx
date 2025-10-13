import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { ViewModeToggle } from '@/components/ui/view-mode-toggle';
import { exportToExcel } from '@/lib/exportUtils';
import { getPersonnelFullInfo } from '@/lib/utils/personnelUtils';
import type { SystemUser } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SystemUsersTabProps {
  onAdd: () => void;
  onEdit: (user: SystemUser) => void;
  onDelete: (id: string) => void;
}

export default function SystemUsersTab({ onAdd, onEdit, onDelete }: SystemUsersTabProps) {
  const user = useAuthStore((state) => state.user);
  const { getSystemUsersByTenant, getPersonnelByTenant, organizations, people, positions } = useSettingsStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    const saved = localStorage.getItem('system-users-view-mode');
    return (saved as 'table' | 'cards') || 'table';
  });

  const systemUsers = getSystemUsersByTenant(user!.tenantId!);
  const personnel = getPersonnelByTenant(user!.tenantId!);

  const getPersonnelInfo = (personnelId?: string) => {
    if (!personnelId) return { name: '—', orgName: '' };
    const personnelRecord = personnel.find(p => p.id === personnelId);
    if (!personnelRecord) return { name: '—', orgName: '' };
    
    const info = getPersonnelFullInfo(personnelRecord, people, positions);
    const org = personnelRecord.organizationId 
      ? organizations.find(o => o.id === personnelRecord.organizationId)
      : null;
    
    return {
      name: info.fullName,
      orgName: org?.name || ''
    };
  };

  const getOrgNames = (orgIds: string[]) => {
    if (!orgIds.length) return 'Все организации';
    return orgIds
      .map(id => organizations.find(o => o.id === id)?.name || id)
      .join(', ');
  };

  const filteredUsers = systemUsers.filter((sysUser) => {
    const personnelInfo = getPersonnelInfo(sysUser.personnelId);
    const matchesSearch = 
      sysUser.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sysUser.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
      personnelInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      personnelInfo.orgName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || sysUser.status === filterStatus;
    const matchesRole = filterRole === 'all' || sysUser.role === filterRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleViewModeChange = (mode: 'table' | 'cards') => {
    setViewMode(mode);
    localStorage.setItem('system-users-view-mode', mode);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SuperAdmin': return 'bg-purple-100 text-purple-800';
      case 'TenantAdmin': return 'bg-blue-100 text-blue-800';
      case 'Manager': return 'bg-green-100 text-green-800';
      case 'Auditor': return 'bg-amber-100 text-amber-800';
      case 'Director': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = () => {
    const exportData = filteredUsers.map(sysUser => {
      const personnelInfo = getPersonnelInfo(sysUser.personnelId);
      return {
        'Login': sysUser.login,
        'Email': sysUser.email,
        'Роль': sysUser.role,
        'Сотрудник': personnelInfo.name,
        'Организация сотрудника': personnelInfo.orgName || '—',
        'Доступ к организациям': getOrgNames(sysUser.organizationAccess),
        'Статус': sysUser.status === 'active' ? 'Активен' : 'Заблокирован',
        'Дата создания': new Date(sysUser.createdAt).toLocaleDateString('ru-RU')
      };
    });
    exportToExcel(exportData, 'Пользователи_системы');
    toast({ title: 'Экспорт завершен', description: `Экспортировано: ${exportData.length} пользователей` });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      SuperAdmin: 'Суперадмин',
      TenantAdmin: 'Администратор',
      Manager: 'Менеджер',
      Auditor: 'Аудитор',
      Director: 'Директор'
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Icon name="Users" size={20} className="text-primary" />
          <span className="text-sm text-muted-foreground">
            Всего: {filteredUsers.length}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Input
            placeholder="Поиск пользователей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />

          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Роль" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все роли</SelectItem>
              <SelectItem value="SuperAdmin">Суперадмин</SelectItem>
              <SelectItem value="TenantAdmin">Администратор</SelectItem>
              <SelectItem value="Manager">Менеджер</SelectItem>
              <SelectItem value="Auditor">Аудитор</SelectItem>
              <SelectItem value="Director">Директор</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активен</SelectItem>
              <SelectItem value="inactive">Неактивен</SelectItem>
            </SelectContent>
          </Select>

          <ViewModeToggle
            value={viewMode}
            onChange={handleViewModeChange}
            modes={['cards', 'table']}
          />

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Icon name="Download" size={14} className="mr-2" />
            Экспорт
          </Button>

          <Button onClick={onAdd}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить пользователя
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Персонал</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Логин</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Доступ к организациям</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Последний вход</TableHead>
                <TableHead className="w-[100px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Нет пользователей
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((sysUser) => {
                  const personnelInfo = getPersonnelInfo(sysUser.personnelId);
                  return (
                  <TableRow key={sysUser.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{personnelInfo.name}</div>
                        {personnelInfo.name !== '—' && personnelInfo.orgName && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {personnelInfo.orgName}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{sysUser.email}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {sysUser.login}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(sysUser.role)}>
                        {getRoleLabel(sysUser.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {getOrgNames(sysUser.organizationAccess)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sysUser.status === 'active' ? 'default' : 'secondary'}>
                        {sysUser.status === 'active' ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {sysUser.lastLogin 
                        ? new Date(sysUser.lastLogin).toLocaleDateString('ru-RU')
                        : '—'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(sysUser)}
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(sysUser.id)}
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
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              Нет пользователей
            </div>
          ) : (
            filteredUsers.map((sysUser) => {
              const personnelInfo = getPersonnelInfo(sysUser.personnelId);
              return (
              <Card key={sysUser.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">
                        {personnelInfo.name}
                      </h3>
                      {personnelInfo.name !== '—' && personnelInfo.orgName && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {personnelInfo.orgName}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mb-2">
                        {sysUser.email}
                      </p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {sysUser.login}
                      </code>
                    </div>
                    <Badge variant={sysUser.status === 'active' ? 'default' : 'secondary'}>
                      {sysUser.status === 'active' ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Роль:</span>
                      <Badge className={getRoleBadgeColor(sysUser.role)}>
                        {getRoleLabel(sysUser.role)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-muted-foreground">Доступ:</span>
                      <p className="mt-1 text-xs">{getOrgNames(sysUser.organizationAccess)}</p>
                    </div>

                    {sysUser.lastLogin && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Последний вход:</span>
                        <span>{new Date(sysUser.lastLogin).toLocaleDateString('ru-RU')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onEdit(sysUser)}
                    >
                      <Icon name="Edit" size={16} className="mr-2" />
                      Изменить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(sysUser.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}