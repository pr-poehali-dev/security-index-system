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
import { Contractor, ContractorFormData, ContractorStatus, ContractorType } from '../../types/contractors';

interface ContractorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor?: Contractor;
  onClose?: () => void;
}

const ContractorFormDialog = ({
  open,
  onOpenChange,
  contractor,
  onClose,
}: ContractorFormDialogProps) => {
  const { createContractor, updateContractor, loading } = useContractorsStore();
  const [workTypesInput, setWorkTypesInput] = useState('');
  const [accreditationsInput, setAccreditationsInput] = useState('');

  const [formData, setFormData] = useState<ContractorFormData>({
    name: '',
    type: 'contractor',
    inn: '',
    kpp: '',
    legalAddress: '',
    actualAddress: '',
    directorName: '',
    contactPhone: '',
    contactEmail: '',
    contractNumber: '',
    contractDate: '',
    contractExpiry: '',
    contractAmount: undefined,
    allowedWorkTypes: [],
    sroNumber: '',
    sroExpiry: '',
    insuranceNumber: '',
    insuranceExpiry: '',
    status: 'active',
    notes: '',
    accreditations: [],
    website: '',
    rating: 0,
  });

  useEffect(() => {
    if (contractor) {
      setFormData({
        name: contractor.name,
        type: contractor.type || 'contractor',
        inn: contractor.inn,
        kpp: contractor.kpp,
        legalAddress: contractor.legalAddress,
        actualAddress: contractor.actualAddress,
        directorName: contractor.directorName,
        contactPhone: contractor.contactPhone,
        contactEmail: contractor.contactEmail,
        contractNumber: contractor.contractNumber,
        contractDate: contractor.contractDate,
        contractExpiry: contractor.contractExpiry,
        contractAmount: contractor.contractAmount,
        allowedWorkTypes: contractor.allowedWorkTypes,
        sroNumber: contractor.sroNumber,
        sroExpiry: contractor.sroExpiry,
        insuranceNumber: contractor.insuranceNumber,
        insuranceExpiry: contractor.insuranceExpiry,
        status: contractor.status,
        notes: contractor.notes,
        accreditations: contractor.accreditations || [],
        website: contractor.website || '',
        rating: contractor.rating || 0,
      });
      setWorkTypesInput(contractor.allowedWorkTypes?.join(', ') || '');
      setAccreditationsInput(contractor.accreditations?.join(', ') || '');
    } else {
      setFormData({
        name: '',
        type: 'contractor',
        inn: '',
        kpp: '',
        legalAddress: '',
        actualAddress: '',
        directorName: '',
        contactPhone: '',
        contactEmail: '',
        contractNumber: '',
        contractDate: '',
        contractExpiry: '',
        contractAmount: undefined,
        allowedWorkTypes: [],
        sroNumber: '',
        sroExpiry: '',
        insuranceNumber: '',
        insuranceExpiry: '',
        status: 'active',
        notes: '',
        accreditations: [],
        website: '',
        rating: 0,
      });
      setWorkTypesInput('');
      setAccreditationsInput('');
    }
  }, [contractor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const workTypes = workTypesInput
      .split(',')
      .map((type) => type.trim())
      .filter((type) => type.length > 0);

    const accreditations = accreditationsInput
      .split(',')
      .map((acc) => acc.trim())
      .filter((acc) => acc.length > 0);

    const dataToSubmit = {
      ...formData,
      allowedWorkTypes: workTypes,
      accreditations,
    };

    if (contractor) {
      await updateContractor(contractor.id, dataToSubmit);
    } else {
      await createContractor(dataToSubmit);
    }

    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contractor ? 'Редактировать подрядчика' : 'Добавить подрядчика'}
          </DialogTitle>
          <DialogDescription>
            {contractor
              ? 'Измените данные подрядной организации'
              : 'Заполните информацию о новой подрядной организации'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Основная информация</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">
                  Название организации <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ООО 'ГазСервис'"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="type">
                  Тип организации <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: ContractorType) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contractor">Подрядчик</SelectItem>
                    <SelectItem value="training_center">Учебный центр</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inn">
                  ИНН <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="inn"
                  required
                  value={formData.inn}
                  onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                  placeholder="1234567890"
                  maxLength={12}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kpp">КПП</Label>
                <Input
                  id="kpp"
                  value={formData.kpp}
                  onChange={(e) => setFormData({ ...formData, kpp: e.target.value })}
                  placeholder="123456789"
                  maxLength={9}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="legalAddress">Юридический адрес</Label>
                <Input
                  id="legalAddress"
                  value={formData.legalAddress}
                  onChange={(e) => setFormData({ ...formData, legalAddress: e.target.value })}
                  placeholder="г. Москва, ул. Примерная, д. 1"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="actualAddress">Фактический адрес</Label>
                <Input
                  id="actualAddress"
                  value={formData.actualAddress}
                  onChange={(e) => setFormData({ ...formData, actualAddress: e.target.value })}
                  placeholder="г. Москва, ул. Примерная, д. 1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Контактные данные</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="directorName">ФИО директора</Label>
                <Input
                  id="directorName"
                  value={formData.directorName}
                  onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                  placeholder="Иванов Иван Иванович"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Телефон</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="info@contractor.ru"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Договор</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractNumber">Номер договора</Label>
                <Input
                  id="contractNumber"
                  value={formData.contractNumber}
                  onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                  placeholder="№ 123/2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractAmount">Сумма договора (руб.)</Label>
                <Input
                  id="contractAmount"
                  type="number"
                  value={formData.contractAmount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contractAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="1000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractDate">Дата договора</Label>
                <Input
                  id="contractDate"
                  type="date"
                  value={formData.contractDate}
                  onChange={(e) => setFormData({ ...formData, contractDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractExpiry">Срок действия до</Label>
                <Input
                  id="contractExpiry"
                  type="date"
                  value={formData.contractExpiry}
                  onChange={(e) => setFormData({ ...formData, contractExpiry: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Допуски и разрешения</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="workTypes">Виды работ</Label>
                <Input
                  id="workTypes"
                  value={workTypesInput}
                  onChange={(e) => setWorkTypesInput(e.target.value)}
                  placeholder="Монтаж, Ремонт, Диагностика (через запятую)"
                />
                <p className="text-xs text-muted-foreground">
                  Укажите виды работ через запятую
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sroNumber">Номер допуска СРО</Label>
                <Input
                  id="sroNumber"
                  value={formData.sroNumber}
                  onChange={(e) => setFormData({ ...formData, sroNumber: e.target.value })}
                  placeholder="СРО-С-123-45678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sroExpiry">Срок действия СРО до</Label>
                <Input
                  id="sroExpiry"
                  type="date"
                  value={formData.sroExpiry}
                  onChange={(e) => setFormData({ ...formData, sroExpiry: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insuranceNumber">Номер страхового полиса</Label>
                <Input
                  id="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                  placeholder="АА 1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insuranceExpiry">Страховка действует до</Label>
                <Input
                  id="insuranceExpiry"
                  type="date"
                  value={formData.insuranceExpiry}
                  onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                />
              </div>
            </div>
          </div>

          {formData.type === 'training_center' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Данные учебного центра</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="website">Веб-сайт</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://training-center.ru"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="accreditations">Аккредитации</Label>
                  <Input
                    id="accreditations"
                    value={accreditationsInput}
                    onChange={(e) => setAccreditationsInput(e.target.value)}
                    placeholder="ISO 9001, РосТехНадзор (через запятую)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Укажите аккредитации через запятую
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Рейтинг (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: e.target.value ? parseFloat(e.target.value) : 0,
                      })
                    }
                    placeholder="4.5"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Дополнительно</h3>
            
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ContractorStatus) =>
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
                  <SelectItem value="archived">Архив</SelectItem>
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
              {contractor ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContractorFormDialog;