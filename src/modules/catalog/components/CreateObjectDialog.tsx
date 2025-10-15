import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { HazardClass, ObjectType } from '@/types/catalog';
import { HAZARD_CLASS_OPTIONS } from '@/constants/hazardClass';

interface CreateObjectDialogProps {
  organizations: Array<{ id: string; name: string }>;
  onSubmit: (data: any) => void;
}

export default function CreateObjectDialog({ organizations, onSubmit }: CreateObjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'opo' as ObjectType,
    hazardClass: 'II' as HazardClass,
    address: '',
    responsiblePerson: '',
    registrationNumber: '',
    registrationDate: new Date().toISOString().split('T')[0],
    organizationId: organizations[0]?.id || '',
    status: 'active' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tenantId: 'tenant-1',
      location: { address: formData.address },
      equipment: [],
      documentation: []
    });
    setIsOpen(false);
    setFormData({
      code: '',
      name: '',
      type: 'opo',
      hazardClass: 'II',
      address: '',
      responsiblePerson: '',
      registrationNumber: '',
      registrationDate: new Date().toISOString().split('T')[0],
      organizationId: organizations[0]?.id || '',
      status: 'active'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                    <SelectItem value="opo">ОПО</SelectItem>
                    <SelectItem value="gts">ГТС</SelectItem>
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
                    {HAZARD_CLASS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
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
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}