import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { ProductionSite } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProductionSitesTabProps {
  onAdd: () => void;
  onEdit: (site: ProductionSite) => void;
  onDelete: (id: string) => void;
}

export default function ProductionSitesTab({ onAdd, onEdit, onDelete }: ProductionSitesTabProps) {
  const user = useAuthStore((state) => state.user);
  const { productionSites, getOrganizationsByTenant, getProductionSitesByOrganization } = useSettingsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    const saved = localStorage.getItem('production-sites-view-mode');
    return (saved as 'table' | 'cards') || 'table';
  });

  const organizations = user?.tenantId ? getOrganizationsByTenant(user.tenantId) : [];
  const tenantSites = productionSites.filter((site) => site.tenantId === user?.tenantId);

  const filteredSites = tenantSites.filter((site) => {
    const matchesSearch = 
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOrg = filterOrg === 'all' || site.organizationId === filterOrg;
    const matchesStatus = filterStatus === 'all' || site.status === filterStatus;

    return matchesSearch && matchesOrg && matchesStatus;
  });

  const getOrganizationName = (orgId: string) => {
    return organizations.find(o => o.id === orgId)?.name || '—';
  };

  const getSitesCountByOrg = (orgId: string) => {
    return getProductionSitesByOrganization(orgId).length;
  };

  const isReadOnly = user?.role !== 'TenantAdmin';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground">
            Всего площадок: {tenantSites.length}
          </p>
          <Input
            placeholder="Поиск по названию, адресу или коду..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72"
          />
          <Select value={filterOrg} onValueChange={setFilterOrg}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Организация" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все организации</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setViewMode('table');
                localStorage.setItem('production-sites-view-mode', 'table');
              }}
              className="rounded-r-none"
            >
              <Icon name="Table" size={16} />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setViewMode('cards');
                localStorage.setItem('production-sites-view-mode', 'cards');
              }}
              className="rounded-l-none"
            >
              <Icon name="LayoutGrid" size={16} />
            </Button>
          </div>
          {!isReadOnly && (
            <Button onClick={onAdd} size="sm" className="gap-2">
              <Icon name="Plus" size={16} />
              Добавить площадку
            </Button>
          )}
        </div>
      </div>

      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Код</TableHead>
                  <TableHead>Организация</TableHead>
                  <TableHead>Адрес</TableHead>
                  <TableHead>Руководитель</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <Icon name="Search" size={48} className="mx-auto mb-4 opacity-20" />
                      <p>Производственные площадки не найдены</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSites.map((site) => (
                    <TableRow key={site.id}>
                      <TableCell className="font-medium">{site.name}</TableCell>
                      <TableCell>
                        {site.code ? (
                          <Badge variant="outline">{site.code}</Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell>{getOrganizationName(site.organizationId)}</TableCell>
                      <TableCell className="max-w-xs truncate">{site.address}</TableCell>
                      <TableCell>{site.head || '—'}</TableCell>
                      <TableCell>{site.phone || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                          {site.status === 'active' ? 'Активна' : 'Неактивна'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onEdit(site)}
                            disabled={isReadOnly}
                          >
                            <Icon name="Pencil" size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => onDelete(site.id)}
                            disabled={isReadOnly}
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
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSites.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Icon name="Search" size={48} className="mx-auto mb-4 opacity-20" />
              <p>Производственные площадки не найдены</p>
            </div>
          ) : (
            filteredSites.map((site) => (
              <Card key={site.id}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{site.name}</h3>
                      <p className="text-sm text-muted-foreground">{getOrganizationName(site.organizationId)}</p>
                    </div>
                    <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                      {site.status === 'active' ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </div>

                  {site.code && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{site.code}</Badge>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Icon name="MapPin" size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="break-words">{site.address}</span>
                    </div>
                    {site.head && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="User" size={14} />
                        <span>{site.head}</span>
                      </div>
                    )}
                    {site.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="Phone" size={14} />
                        <span>{site.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => onEdit(site)}
                      disabled={isReadOnly}
                    >
                      <Icon name="Pencil" size={14} />
                      Изменить
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDelete(site.id)}
                      disabled={isReadOnly}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
