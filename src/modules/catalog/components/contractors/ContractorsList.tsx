import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useContractorsStore } from '../../stores/contractorsStore';
import { Contractor, ContractorStatus } from '../../types/contractors';
import ContractorFormDialog from './ContractorFormDialog';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ContractorsList = () => {
  const { contractors, loading, fetchContractors, deleteContractor } = useContractorsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractorStatus | 'all'>('all');
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  const filteredContractors = contractors.filter((contractor) => {
    const matchesSearch =
      contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.inn.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || contractor.status === statusFilter;
    return matchesSearch && matchesStatus;
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
        <div className="flex gap-2">
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
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContractors.map((contractor) => (
            <Card key={contractor.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{contractor.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      ИНН: {contractor.inn}
                      {contractor.kpp && ` / КПП: ${contractor.kpp}`}
                    </p>
                  </div>
                  {getStatusBadge(contractor.status)}
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
