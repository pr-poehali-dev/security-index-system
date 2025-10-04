import { useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import type { HazardClass, ObjectType } from '@/types/catalog';

export default function CatalogPage() {
  const { organizations, objects, addObject } = useCatalogStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'industrial' as ObjectType,
    hazardClass: '2' as HazardClass,
    address: '',
    responsiblePerson: '',
    registrationNumber: '',
    registrationDate: new Date().toISOString().split('T')[0],
    organizationId: organizations[0]?.id || '',
    status: 'active' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addObject({
      ...formData,
      tenantId: 'tenant-1',
      location: { address: formData.address },
      equipment: [],
      documentation: []
    });
    setIsCreateDialogOpen(false);
    setFormData({
      code: '',
      name: '',
      type: 'industrial',
      hazardClass: '2',
      address: '',
      responsiblePerson: '',
      registrationNumber: '',
      registrationDate: new Date().toISOString().split('T')[0],
      organizationId: organizations[0]?.id || '',
      status: 'active'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'decommissioned': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'inactive': return 'Неактивен';
      case 'decommissioned': return 'Ликвидирован';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      industrial: 'ОПО',
      energy: 'Энергетика',
      mining: 'Горнодобывающий',
      chemical: 'Химический',
      gas: 'Газовый',
      building: 'Здание',
      other: 'Прочее'
    };
    return labels[type] || type;
  };

  return (
    <div>
      <PageHeader
        title="Каталог объектов"
        description="Учет опасных производственных объектов и оборудования"
        icon="Building"
        action={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Icon name="Plus" size={18} />
                Добавить объект
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Создание объекта</DialogTitle>
                  <DialogDescription>
                    Заполните данные опасного производственного объекта
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Код объекта *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Наименование *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Тип объекта *</Label>
                      <Select value={formData.type} onValueChange={(value: ObjectType) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="industrial">ОПО</SelectItem>
                          <SelectItem value="energy">Энергетика</SelectItem>
                          <SelectItem value="chemical">Химический</SelectItem>
                          <SelectItem value="gas">Газовый</SelectItem>
                          <SelectItem value="building">Здание</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hazardClass">Класс опасности *</Label>
                      <Select value={formData.hazardClass} onValueChange={(value: HazardClass) => setFormData({ ...formData, hazardClass: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">I класс (высокий)</SelectItem>
                          <SelectItem value="2">II класс (средний)</SelectItem>
                          <SelectItem value="3">III класс (низкий)</SelectItem>
                          <SelectItem value="4">IV класс (очень низкий)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Адрес *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Регистрационный номер *</Label>
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationDate">Дата регистрации *</Label>
                      <Input
                        id="registrationDate"
                        type="date"
                        value={formData.registrationDate}
                        onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsiblePerson">Ответственный *</Label>
                    <Input
                      id="responsiblePerson"
                      value={formData.responsiblePerson}
                      onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizationId">Организация *</Label>
                    <Select value={formData.organizationId} onValueChange={(value) => setFormData({ ...formData, organizationId: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      <Icon name="Plus" className="mr-2" size={18} />
                      Создать объект
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Отмена
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs defaultValue="objects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="objects">Объекты ({objects.length})</TabsTrigger>
          <TabsTrigger value="organizations">Организации ({organizations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="objects" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {objects.map((obj) => (
              <Card key={obj.id} className="hover-scale">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                        <Icon name="Building" className="text-emerald-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{obj.name}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{obj.code}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(obj.status)}>
                      {getStatusLabel(obj.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{getTypeLabel(obj.type)}</Badge>
                    <Badge variant="outline">Класс {obj.hazardClass}</Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-gray-500 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{obj.location.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="User" size={16} className="text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{obj.responsiblePerson}</span>
                    </div>
                    {obj.nextExaminationDate && (
                      <div className="flex items-center gap-2">
                        <Icon name="Calendar" size={16} className="text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Экспертиза: {new Date(obj.nextExaminationDate).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Icon name="Eye" className="mr-1" size={14} />
                      Просмотр
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon name="FileText" size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizations.map((org) => (
              <Card key={org.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Icon name="Building2" className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{org.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">ИНН: {org.inn}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{org.type === 'holding' ? 'Холдинг' : org.type === 'legal_entity' ? 'Юр.лицо' : 'Филиал'}</Badge>
                    <span className="text-sm text-gray-600">
                      Объектов: {objects.filter(o => o.organizationId === org.id).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
