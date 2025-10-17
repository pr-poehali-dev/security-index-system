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

export default function OpoTab() {
  const user = useAuthStore((state) => state.user);
  const { getFacilitiesByTenant, deleteFacility, getComponentsByFacility } = useFacilitiesStore();
  const allFacilities = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];
  const facilities = allFacilities.filter(f => f.type === 'opo');
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [hazardClassFilter, setHazardClassFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingFacility, setEditingFacility] = useState<string | null>(null);

  const filteredFacilities = facilities.filter((facility) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      facility.fullName.toLowerCase().includes(query) ||
      facility.typicalName?.toLowerCase().includes(query) ||
      facility.registrationNumber?.toLowerCase().includes(query) ||
      facility.organizationName.toLowerCase().includes(query);
    
    const matchesClass = hazardClassFilter === 'all' || facility.hazardClass === hazardClassFilter;
    
    return matchesSearch && matchesClass;
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
    toast({ title: 'ОПО удален' });
  };

  const stats = {
    total: facilities.length,
    class1: facilities.filter(f => f.hazardClass === 'I').length,
    class2: facilities.filter(f => f.hazardClass === 'II').length,
    class3: facilities.filter(f => f.hazardClass === 'III').length,
    class4: facilities.filter(f => f.hazardClass === 'IV').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Icon name="Factory" size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Всего ОПО</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Icon name="AlertCircle" size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.class1}</p>
                <p className="text-xs text-muted-foreground">I класс</p>
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
                <p className="text-2xl font-bold">{stats.class2}</p>
                <p className="text-xs text-muted-foreground">II класс</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Icon name="AlertTriangle" size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.class3}</p>
                <p className="text-xs text-muted-foreground">III класс</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Icon name="Shield" size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.class4}</p>
                <p className="text-xs text-muted-foreground">IV класс</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Опасные производственные объекты</CardTitle>
            <Button onClick={handleAdd}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить ОПО
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
            
            <Select value={hazardClassFilter} onValueChange={setHazardClassFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Класс опасности" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все классы</SelectItem>
                <SelectItem value="I">I класс</SelectItem>
                <SelectItem value="II">II класс</SelectItem>
                <SelectItem value="III">III класс</SelectItem>
                <SelectItem value="IV">IV класс</SelectItem>
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
