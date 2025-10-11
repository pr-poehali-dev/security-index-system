import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddEmployeeDialog({ open, onOpenChange }: AddEmployeeDialogProps) {
  const { toast } = useToast();
  const { organizations, departments, positions } = useSettingsStore();
  const user = useAuthStore((state) => state.user);
  
  const activeOrganizations = organizations.filter(org => org.status === 'active');
  const activeDepartments = user?.tenantId 
    ? departments.filter(dept => dept.tenantId === user.tenantId && dept.status === 'active')
    : [];
  const activePositions = user?.tenantId
    ? positions.filter(pos => pos.tenantId === user.tenantId && pos.status === 'active')
    : [];
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    position: '',
    department: '',
    organization: '',
    personnelNumber: '',
    email: '',
    phone: '',
  });

  const handleSubmit = () => {
    if (!formData.lastName || !formData.firstName || !formData.position || !formData.department || !formData.organization) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля",
        variant: "destructive",
      });
      return;
    }

    const selectedOrg = organizations.find(org => org.id === formData.organization);
    
    toast({
      title: "Сотрудник добавлен",
      description: `${formData.lastName} ${formData.firstName} ${formData.middleName} успешно добавлен в ${selectedOrg?.name || 'организацию'}`,
    });

    setFormData({
      lastName: '',
      firstName: '',
      middleName: '',
      position: '',
      department: '',
      organization: '',
      personnelNumber: '',
      email: '',
      phone: '',
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить сотрудника</DialogTitle>
          <DialogDescription>
            Заполните данные нового сотрудника
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Фамилия <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Иванов"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">
                Имя <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Иван"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Отчество</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                placeholder="Иванович"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">
                Должность <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                <SelectTrigger id="position">
                  <SelectValue placeholder="Выберите должность" />
                </SelectTrigger>
                <SelectContent>
                  {activePositions.length > 0 ? (
                    activePositions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Нет доступных должностей
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personnelNumber">Табельный номер</Label>
              <Input
                id="personnelNumber"
                value={formData.personnelNumber}
                onChange={(e) => setFormData({ ...formData, personnelNumber: e.target.value })}
                placeholder="12345"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization">
                Организация <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.organization} onValueChange={(value) => setFormData({ ...formData, organization: value })}>
                <SelectTrigger id="organization">
                  <SelectValue placeholder="Выберите организацию" />
                </SelectTrigger>
                <SelectContent>
                  {activeOrganizations.length > 0 ? (
                    activeOrganizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Нет доступных организаций
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">
                Подразделение <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Выберите подразделение" />
                </SelectTrigger>
                <SelectContent>
                  {activeDepartments.length > 0 ? (
                    activeDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Нет доступных подразделений
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ivanov@example.com"
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
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Icon name="Info" size={16} className="mt-0.5" />
              <p>
                После добавления сотрудника вы сможете внести его аттестации и допуски
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Icon name="UserPlus" size={16} />
            Добавить сотрудника
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}