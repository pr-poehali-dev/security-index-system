import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useContractorsStore } from '../../stores/contractorsStore';
import { ContractorEmployee, EmployeeFormData, EmployeeStatus } from '../../types/contractors';

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: ContractorEmployee;
  onClose?: () => void;
}

const EmployeeFormDialog = ({
  open,
  onOpenChange,
  employee,
  onClose,
}: EmployeeFormDialogProps) => {
  const { contractors, createEmployee, updateEmployee, loading } = useContractorsStore();

  const [formData, setFormData] = useState<EmployeeFormData>({
    contractorId: '',
    fullName: '',
    position: '',
    phone: '',
    email: '',
    passportSeries: '',
    passportNumber: '',
    snils: '',
    medicalCheckupDate: '',
    medicalCheckupExpiry: '',
    fireSafetyTrainingDate: '',
    fireSafetyTrainingExpiry: '',
    laborSafetyTrainingDate: '',
    laborSafetyTrainingExpiry: '',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        contractorId: employee.contractorId,
        fullName: employee.fullName,
        position: employee.position,
        phone: employee.phone,
        email: employee.email,
        passportSeries: employee.passportSeries,
        passportNumber: employee.passportNumber,
        snils: employee.snils,
        medicalCheckupDate: employee.medicalCheckupDate,
        medicalCheckupExpiry: employee.medicalCheckupExpiry,
        fireSafetyTrainingDate: employee.fireSafetyTrainingDate,
        fireSafetyTrainingExpiry: employee.fireSafetyTrainingExpiry,
        laborSafetyTrainingDate: employee.laborSafetyTrainingDate,
        laborSafetyTrainingExpiry: employee.laborSafetyTrainingExpiry,
        status: employee.status,
        notes: employee.notes,
      });
    } else {
      setFormData({
        contractorId: '',
        fullName: '',
        position: '',
        phone: '',
        email: '',
        passportSeries: '',
        passportNumber: '',
        snils: '',
        medicalCheckupDate: '',
        medicalCheckupExpiry: '',
        fireSafetyTrainingDate: '',
        fireSafetyTrainingExpiry: '',
        laborSafetyTrainingDate: '',
        laborSafetyTrainingExpiry: '',
        status: 'active',
        notes: '',
      });
    }
  }, [employee, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (employee) {
      await updateEmployee(employee.id, formData);
    } else {
      await createEmployee(formData);
    }

    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    onClose?.();
  };

  const isDocumentExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.floor(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const isDocumentExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? 'Измените данные сотрудника подрядчика'
              : 'Заполните информацию о новом сотруднике подрядчика'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Основная информация</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="contractorId">
                  Подрядная организация <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.contractorId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, contractorId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите подрядчика" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractors
                      .filter((contractor) => contractor.type === 'contractor')
                      .map((contractor) => (
                        <SelectItem key={contractor.id} value={contractor.id}>
                          {contractor.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="fullName">
                  ФИО <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Иванов Иван Иванович"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="position">Должность</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Слесарь-ремонтник"
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

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ivanov@contractor.ru"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Документы</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passportSeries">Серия паспорта</Label>
                <Input
                  id="passportSeries"
                  value={formData.passportSeries}
                  onChange={(e) =>
                    setFormData({ ...formData, passportSeries: e.target.value })
                  }
                  placeholder="1234"
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passportNumber">Номер паспорта</Label>
                <Input
                  id="passportNumber"
                  value={formData.passportNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, passportNumber: e.target.value })
                  }
                  placeholder="567890"
                  maxLength={6}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="snils">СНИЛС</Label>
                <Input
                  id="snils"
                  value={formData.snils}
                  onChange={(e) => setFormData({ ...formData, snils: e.target.value })}
                  placeholder="123-456-789 00"
                  maxLength={14}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Медицинский осмотр</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicalCheckupDate">Дата медосмотра</Label>
                <Input
                  id="medicalCheckupDate"
                  type="date"
                  value={formData.medicalCheckupDate}
                  onChange={(e) =>
                    setFormData({ ...formData, medicalCheckupDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalCheckupExpiry">
                  Действителен до
                  {isDocumentExpired(formData.medicalCheckupExpiry) && (
                    <span className="text-red-600 ml-2">
                      <Icon name="AlertCircle" size={14} className="inline mr-1" />
                      Истек
                    </span>
                  )}
                  {isDocumentExpiringSoon(formData.medicalCheckupExpiry) && (
                    <span className="text-orange-600 ml-2">
                      <Icon name="AlertTriangle" size={14} className="inline mr-1" />
                      Истекает скоро
                    </span>
                  )}
                </Label>
                <Input
                  id="medicalCheckupExpiry"
                  type="date"
                  value={formData.medicalCheckupExpiry}
                  onChange={(e) =>
                    setFormData({ ...formData, medicalCheckupExpiry: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Обучение по пожарной безопасности</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fireSafetyTrainingDate">Дата обучения</Label>
                <Input
                  id="fireSafetyTrainingDate"
                  type="date"
                  value={formData.fireSafetyTrainingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, fireSafetyTrainingDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fireSafetyTrainingExpiry">
                  Действительно до
                  {isDocumentExpired(formData.fireSafetyTrainingExpiry) && (
                    <span className="text-red-600 ml-2">
                      <Icon name="AlertCircle" size={14} className="inline mr-1" />
                      Истекло
                    </span>
                  )}
                  {isDocumentExpiringSoon(formData.fireSafetyTrainingExpiry) && (
                    <span className="text-orange-600 ml-2">
                      <Icon name="AlertTriangle" size={14} className="inline mr-1" />
                      Истекает скоро
                    </span>
                  )}
                </Label>
                <Input
                  id="fireSafetyTrainingExpiry"
                  type="date"
                  value={formData.fireSafetyTrainingExpiry}
                  onChange={(e) =>
                    setFormData({ ...formData, fireSafetyTrainingExpiry: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Обучение по охране труда</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="laborSafetyTrainingDate">Дата обучения</Label>
                <Input
                  id="laborSafetyTrainingDate"
                  type="date"
                  value={formData.laborSafetyTrainingDate}
                  onChange={(e) =>
                    setFormData({ ...formData, laborSafetyTrainingDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="laborSafetyTrainingExpiry">
                  Действительно до
                  {isDocumentExpired(formData.laborSafetyTrainingExpiry) && (
                    <span className="text-red-600 ml-2">
                      <Icon name="AlertCircle" size={14} className="inline mr-1" />
                      Истекло
                    </span>
                  )}
                  {isDocumentExpiringSoon(formData.laborSafetyTrainingExpiry) && (
                    <span className="text-orange-600 ml-2">
                      <Icon name="AlertTriangle" size={14} className="inline mr-1" />
                      Истекает скоро
                    </span>
                  )}
                </Label>
                <Input
                  id="laborSafetyTrainingExpiry"
                  type="date"
                  value={formData.laborSafetyTrainingExpiry}
                  onChange={(e) =>
                    setFormData({ ...formData, laborSafetyTrainingExpiry: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Дополнительно</h3>

            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value: EmployeeStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="suspended">Приостановлен</SelectItem>
                  <SelectItem value="blocked">Заблокирован</SelectItem>
                  <SelectItem value="dismissed">Уволен</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Примечания</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Дополнительная информация..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Icon name="Loader2" className="mr-2 animate-spin" size={16} />}
              {employee ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeFormDialog;