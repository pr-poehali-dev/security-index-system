import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useAuthStore } from '@/stores/authStore';
import { useFacilitiesStore } from '@/stores/facilitiesStore';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FacilityDialog from './FacilityDialog';
import FacilitiesTable from './FacilitiesTable';

export default function FacilitiesTab() {
  const user = useAuthStore((state) => state.user);
  const { getFacilitiesByTenant, deleteFacility, getComponentsByFacility } = useFacilitiesStore();
  const facilities = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingFacility, setEditingFacility] = useState<string | null>(null);

  const filteredFacilities = facilities.filter((facility) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      facility.fullName.toLowerCase().includes(query) ||
      facility.typicalName?.toLowerCase().includes(query) ||
      facility.registrationNumber?.toLowerCase().includes(query) ||
      facility.organizationName.toLowerCase().includes(query);
    
    const matchesType = typeFilter === 'all' || facility.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleAdd = () => {
    setEditingFacility(null);
    setShowDialog(true);
  };

  const handleEdit = (id: string) => {
    setEditingFacility(id);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    const components = getComponentsByFacility(id);
    if (components.length > 0) {
      if (!confirm(`У объекта есть ${components.length} компонентов. Удалить объект и все компоненты?`)) {
        return;
      }
    }
    deleteFacility(id);
    toast({ title: 'Объект удален' });
  };

  const stats = {
    total: facilities.length,
    opo: facilities.filter(f => f.type === 'opo').length,
    gts: facilities.filter(f => f.type === 'gts').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Icon name="Factory" size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Всего объектов</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Icon name="AlertTriangle" size={20} className="text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.opo}</p>
                <p className="text-xs text-muted-foreground">ОПО</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                <Icon name="Waves" size={20} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.gts}</p>
                <p className="text-xs text-muted-foreground">ГТС</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Опасные производственные объекты и ГТС</CardTitle>
            <Button onClick={handleAdd}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить объект
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Icon
                name="Search"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Поиск по названию, рег. номеру, организации..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Тип объекта" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="opo">ОПО</SelectItem>
                <SelectItem value="gts">ГТС</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FacilitiesTable
            facilities={filteredFacilities}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <FacilityDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        facilityId={editingFacility}
      />
    </div>
  );
}
