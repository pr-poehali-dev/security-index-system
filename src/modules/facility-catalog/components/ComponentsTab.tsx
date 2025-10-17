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
import ComponentDialog from './ComponentDialog';
import ComponentsTable from './ComponentsTable';
import BulkImportDialog from './BulkImportDialog';

export default function ComponentsTab() {
  const user = useAuthStore((state) => state.user);
  const { getComponentsByTenant, deleteComponent, getFacilitiesByTenant } = useFacilitiesStore();
  const components = user?.tenantId ? getComponentsByTenant(user.tenantId) : [];
  const facilities = user?.tenantId ? getFacilitiesByTenant(user.tenantId) : [];
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [facilityFilter, setFacilityFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingComponent, setEditingComponent] = useState<string | null>(null);

  const filteredComponents = components.filter((component) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      component.fullName.toLowerCase().includes(query) ||
      component.shortName?.toLowerCase().includes(query) ||
      component.factoryNumber?.toLowerCase().includes(query) ||
      component.facilityName.toLowerCase().includes(query);
    
    const matchesType = typeFilter === 'all' || component.type === typeFilter;
    const matchesFacility = facilityFilter === 'all' || component.facilityId === facilityFilter;
    
    return matchesSearch && matchesType && matchesFacility;
  });

  const handleAdd = () => {
    setEditingComponent(null);
    setShowDialog(true);
  };

  const handleEdit = (id: string) => {
    setEditingComponent(id);
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить компонент?')) {
      deleteComponent(id);
      toast({ title: 'Компонент удален' });
    }
  };

  const stats = {
    total: components.length,
    technicalDevices: components.filter(c => c.type === 'technical_device').length,
    buildings: components.filter(c => c.type === 'building_structure').length,
    needsAttention: components.filter(
      c => c.technicalStatus === 'needs_repair' || c.technicalStatus === 'needs_replacement'
    ).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Icon name="Cpu" size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Всего компонентов</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Icon name="Cog" size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.technicalDevices}</p>
                <p className="text-xs text-muted-foreground">Технические устройства</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                <Icon name="Home" size={20} className="text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.buildings}</p>
                <p className="text-xs text-muted-foreground">Здания и сооружения</p>
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
                <p className="text-2xl font-bold">{stats.needsAttention}</p>
                <p className="text-xs text-muted-foreground">Требует внимания</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Технические устройства и здания/сооружения</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                <Icon name="Upload" size={16} className="mr-2" />
                Импорт из Excel
              </Button>
              <Button onClick={handleAdd}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить компонент
              </Button>
            </div>
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
                placeholder="Поиск по названию, номеру, объекту..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="technical_device">Технические устройства</SelectItem>
                <SelectItem value="building_structure">Здания и сооружения</SelectItem>
              </SelectContent>
            </Select>

            <Select value={facilityFilter} onValueChange={setFacilityFilter}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Объект" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все объекты</SelectItem>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ComponentsTable
            components={filteredComponents}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <ComponentDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        componentId={editingComponent}
      />

      <BulkImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
    </div>
  );
}