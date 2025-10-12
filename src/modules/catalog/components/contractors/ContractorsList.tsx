import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { useContractorsStore } from '../../stores/contractorsStore';
import { Contractor, ContractorStatus, ContractorType } from '../../types/contractors';
import ContractorFormDialog from './ContractorFormDialog';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

type ViewMode = 'grid' | 'table';

const ContractorsList = () => {
  const { contractors, loading, fetchContractors, deleteContractor } = useContractorsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractorStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ContractorType | 'all'>('all');
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  const filteredContractors = contractors.filter((contractor) => {
    const matchesSearch =
      contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.inn.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || contractor.status === statusFilter;
    const matchesType = typeFilter === 'all' || (contractor.type || 'contractor') === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: ContractorStatus) => {
    const variants: Record<ContractorStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Активен', variant: 'default' },
      suspended: { label: 'Приостановлен', variant: 'secondary' },
      blocked: { label: 'Заблокирован', variant: 'destructive' },
      archived: { label: 'Архив', variant: 'outline' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type?: ContractorType) => {
    const actualType = type || 'contractor';
    const config = {
      contractor: { label: 'Подрядчик', icon: 'Briefcase' as const, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
      training_center: { label: 'Учебный центр', icon: 'GraduationCap' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
    };
    const typeConfig = config[actualType];
    return (
      <Badge variant="outline" className={typeConfig.className}>
        <Icon name={typeConfig.icon} size={12} className="mr-1" />
        {typeConfig.label}
      </Badge>
    );
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Icon key={`full-${i}`} name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
        ))}
        {halfStar && <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500/50" />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Icon key={`empty-${i}`} name="Star" size={14} className="text-gray-300" />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const handleEdit = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этого подрядчика?')) {
      await deleteContractor(id);
    }
  };

  const isContractExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.floor(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const isContractExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию или ИНН..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-r-none"
            >
              <Icon name="Table" size={16} />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-l-none"
            >
              <Icon name="LayoutGrid" size={16} />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground self-center">Тип:</span>
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
            >
              Все
            </Button>
            <Button
              variant={typeFilter === 'contractor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('contractor')}
            >
              <Icon name="Briefcase" size={14} className="mr-1" />
              Подрядчики
            </Button>
            <Button
              variant={typeFilter === 'training_center' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('training_center')}
            >
              <Icon name="GraduationCap" size={14} className="mr-1" />
              Учебные центры
            </Button>
          </div>
          
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground self-center">Статус:</span>
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Все
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('active')}
            >
              Активные
            </Button>
            <Button
              variant={statusFilter === 'suspended' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('suspended')}
            >
              Приостановлены
            </Button>
          </div>
        </div>
      </div>

      {filteredContractors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon name="Building2" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Подрядчики не найдены'
                : 'Нет добавленных подрядчиков'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Организация</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>ИНН / КПП</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Договор</TableHead>
                  <TableHead>Рейтинг</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContractors.map((contractor) => (
                  <TableRow key={contractor.id}>
                    <TableCell>
                      <div className="font-medium">{contractor.name}</div>
                      {contractor.directorName && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {contractor.directorName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getTypeBadge(contractor.type)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{contractor.inn}</div>
                      {contractor.kpp && (
                        <div className="text-xs text-muted-foreground">{contractor.kpp}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {contractor.contactPhone && (
                        <div className="text-sm">
                          <a href={`tel:${contractor.contactPhone}`} className="hover:underline">
                            {contractor.contactPhone}
                          </a>
                        </div>
                      )}
                      {contractor.contactEmail && (
                        <div className="text-xs text-muted-foreground">
                          {contractor.contactEmail}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {contractor.contractNumber ? (
                        <>
                          <div className="text-sm font-medium">{contractor.contractNumber}</div>
                          {contractor.contractExpiry && (
                            <div
                              className={`text-xs ${
                                isContractExpired(contractor.contractExpiry)
                                  ? 'text-red-600'
                                  : isContractExpiringSoon(contractor.contractExpiry)
                                  ? 'text-orange-600'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              до {format(new Date(contractor.contractExpiry), 'dd.MM.yyyy', { locale: ru })}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getRatingStars(contractor.rating)}</TableCell>
                    <TableCell>{getStatusBadge(contractor.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(contractor)}
                        >
                          <Icon name="Edit" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(contractor.id)}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContractors.map((contractor) => (
            <Card key={contractor.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{contractor.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ИНН: {contractor.inn}
                      {contractor.kpp && ` / КПП: ${contractor.kpp}`}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(contractor.status)}
                    {getTypeBadge(contractor.type)}
                  </div>
                </div>
                <div className="mt-2">{getRatingStars(contractor.rating)}</div>
              </CardHeader>
              <CardContent className="space-y-3">
                {contractor.contractNumber && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="FileText" size={14} className="text-muted-foreground" />
                      <span className="text-muted-foreground">Договор:</span>
                      <span className="font-medium">{contractor.contractNumber}</span>
                    </div>
                    {contractor.contractExpiry && (
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Calendar" size={14} className="text-muted-foreground" />
                        <span className="text-muted-foreground">Действует до:</span>
                        <span
                          className={`font-medium ${
                            isContractExpired(contractor.contractExpiry)
                              ? 'text-red-600'
                              : isContractExpiringSoon(contractor.contractExpiry)
                              ? 'text-orange-600'
                              : ''
                          }`}
                        >
                          {format(new Date(contractor.contractExpiry), 'dd.MM.yyyy', { locale: ru })}
                        </span>
                        {isContractExpired(contractor.contractExpiry) && (
                          <Badge variant="destructive" className="ml-auto text-xs">
                            Истек
                          </Badge>
                        )}
                        {isContractExpiringSoon(contractor.contractExpiry) && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            <Icon name="AlertTriangle" size={12} className="mr-1" />
                            Скоро истечет
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {contractor.directorName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="User" size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">Директор:</span>
                    <span>{contractor.directorName}</span>
                  </div>
                )}

                {contractor.contactPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Phone" size={14} className="text-muted-foreground" />
                    <a href={`tel:${contractor.contactPhone}`} className="hover:underline">
                      {contractor.contactPhone}
                    </a>
                  </div>
                )}

                {contractor.allowedWorkTypes && contractor.allowedWorkTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {contractor.allowedWorkTypes.slice(0, 3).map((type, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {contractor.allowedWorkTypes.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{contractor.allowedWorkTypes.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(contractor)}>
                    <Icon name="Edit" size={14} className="mr-1" />
                    Изменить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDelete(contractor.id)}
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ContractorFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        contractor={selectedContractor || undefined}
        onClose={() => setSelectedContractor(null)}
      />
    </div>
  );
};

export default ContractorsList;