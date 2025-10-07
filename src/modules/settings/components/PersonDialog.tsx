import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToast } from '@/hooks/use-toast';
import type { Person } from '@/types';

interface PersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person?: Person;
}

export default function PersonDialog({ open, onOpenChange, person }: PersonDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { addPerson, updatePerson } = useSettingsStore();
  const { toast } = useToast();
  const isEdit = !!person;

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    snils: '',
    inn: '',
    email: '',
    phone: '',
    address: '',
    educationLevel: 'secondary' as Person['educationLevel'],
    status: 'active' as Person['status']
  });

  useEffect(() => {
    if (person) {
      setFormData({
        lastName: person.lastName,
        firstName: person.firstName,
        middleName: person.middleName || '',
        birthDate: person.birthDate || '',
        snils: person.snils || '',
        inn: person.inn || '',
        email: person.email || '',
        phone: person.phone || '',
        address: person.address || '',
        educationLevel: person.educationLevel || 'secondary',
        status: person.status
      });
    } else {
      setFormData({
        lastName: '',
        firstName: '',
        middleName: '',
        birthDate: '',
        snils: '',
        inn: '',
        email: '',
        phone: '',
        address: '',
        educationLevel: 'secondary',
        status: 'active'
      });
    }
  }, [person, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.lastName.trim() || !formData.firstName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля: Фамилия и Имя',
        variant: 'destructive'
      });
      return;
    }

    if (isEdit) {
      updatePerson(person.id, formData);
      toast({ title: 'Данные обновлены', description: 'Информация о человеке успешно обновлена' });
    } else {
      addPerson({
        ...formData,
        tenantId: user!.tenantId!,
        middleName: formData.middleName || undefined,
        birthDate: formData.birthDate || undefined,
        snils: formData.snils || undefined,
        inn: formData.inn || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined
      });
      toast({ title: 'Человек добавлен', description: 'Новая запись успешно создана' });
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Редактирование человека' : 'Добавление человека'}</DialogTitle>
          <DialogDescription>
            Основная информация о человеке (ФИО, контакты, документы)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">Имя *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Отчество</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Дата рождения</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="snils">СНИЛС</Label>
              <Input
                id="snils"
                value={formData.snils}
                onChange={(e) => setFormData({ ...formData, snils: e.target.value })}
                placeholder="123-456-789 00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inn">ИНН</Label>
              <Input
                id="inn"
                value={formData.inn}
                onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                placeholder="770112345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Адрес</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="educationLevel">Образование</Label>
              <Select value={formData.educationLevel} onValueChange={(value) => setFormData({ ...formData, educationLevel: value as Person['educationLevel'] })}>
                <SelectTrigger id="educationLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secondary">Среднее</SelectItem>
                  <SelectItem value="specialized_secondary">Среднее специальное</SelectItem>
                  <SelectItem value="incomplete_higher">Неполное высшее</SelectItem>
                  <SelectItem value="higher">Высшее</SelectItem>
                  <SelectItem value="postgraduate">Послевузовское</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Person['status'] })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="inactive">Неактивный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {isEdit ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
