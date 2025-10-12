import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTenantsStore } from '@/stores/tenantsStore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OrganizationContractor, ContractorServiceType } from '@/types';

interface ContractorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor?: OrganizationContractor | null;
}

interface FormData {
  contractorTenantId?: string;
  contractorExternalOrgId?: string;
  contractorName: string;
  contractorInn?: string;
  type: 'training_center' | 'contractor' | 'supplier';
  services: ContractorServiceType[];
  contractNumber?: string;
  contractDate?: string;
  contractExpiryDate?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: 'active' | 'suspended' | 'terminated';
  notes?: string;
}

export default function ContractorDialog({ open, onOpenChange, contractor }: ContractorDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { addContractor, updateContractor } = useSettingsStore();
  const { tenants } = useTenantsStore();
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: contractor || {
      type: 'training_center',
      services: [],
      status: 'active',
    },
  });

  const type = watch('type');
  const services = watch('services') || [];
  const contractorTenantId = watch('contractorTenantId');

  const trainingCenterTenants = tenants.filter(t => 
    t.modules.includes('training-center') && t.id !== user?.tenantId
  );

  const onSubmit = (data: FormData) => {
    if (!user?.tenantId) return;

    if (contractor) {
      updateContractor(contractor.id, data);
      toast({ title: 'Контрагент обновлен' });
    } else {
      addContractor({
        ...data,
        tenantId: user.tenantId,
      });
      toast({ title: 'Контрагент добавлен' });
    }

    reset();
    onOpenChange(false);
  };

  const toggleService = (service: ContractorServiceType) => {
    const newServices = services.includes(service)
      ? services.filter(s => s !== service)
      : [...services, service];
    setValue('services', newServices);
  };

  const handleTenantSelect = (tenantId: string) => {
    setValue('contractorTenantId', tenantId);
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      setValue('contractorName', tenant.name);
      setValue('contractorInn', tenant.inn);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contractor ? 'Редактировать контрагента' : 'Добавить контрагента'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Тип контрагента</Label>
              <Select
                value={type}
                onValueChange={(value: any) => setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training_center">Учебный центр</SelectItem>
                  <SelectItem value="contractor">Подрядчик</SelectItem>
                  <SelectItem value="supplier">Поставщик</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === 'training_center' && trainingCenterTenants.length > 0 && (
              <div>
                <Label>Выбрать учебный центр из системы (опционально)</Label>
                <Select
                  value={contractorTenantId}
                  onValueChange={handleTenantSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите из списка или укажите вручную" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainingCenterTenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name} (ИНН: {tenant.inn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  При выборе учебного центра из системы заявки будут автоматически передаваться
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="contractorName">Название организации *</Label>
              <Input
                id="contractorName"
                {...register('contractorName', { required: true })}
                placeholder="АНО ДПО 'Учебный центр'"
              />
              {errors.contractorName && (
                <p className="text-sm text-destructive mt-1">Обязательное поле</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contractorInn">ИНН</Label>
                <Input
                  id="contractorInn"
                  {...register('contractorInn')}
                  placeholder="1234567890"
                />
              </div>

              <div>
                <Label>Статус</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value: any) => setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активный</SelectItem>
                    <SelectItem value="suspended">Приостановлен</SelectItem>
                    <SelectItem value="terminated">Расторгнут</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Предоставляемые услуги</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="service-full"
                    checked={services.includes('full_training')}
                    onCheckedChange={() => toggleService('full_training')}
                  />
                  <label htmlFor="service-full" className="text-sm cursor-pointer">
                    Полное обучение
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="service-sdo"
                    checked={services.includes('sdo_access_only')}
                    onCheckedChange={() => toggleService('sdo_access_only')}
                  />
                  <label htmlFor="service-sdo" className="text-sm cursor-pointer">
                    Только СДО доступ
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="service-cert"
                    checked={services.includes('certification')}
                    onCheckedChange={() => toggleService('certification')}
                  />
                  <label htmlFor="service-cert" className="text-sm cursor-pointer">
                    Аттестация
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="service-consulting"
                    checked={services.includes('consulting')}
                    onCheckedChange={() => toggleService('consulting')}
                  />
                  <label htmlFor="service-consulting" className="text-sm cursor-pointer">
                    Консалтинг
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="contractNumber">Номер договора</Label>
                <Input
                  id="contractNumber"
                  {...register('contractNumber')}
                  placeholder="№ 123/2024"
                />
              </div>
              <div>
                <Label htmlFor="contractDate">Дата договора</Label>
                <Input
                  id="contractDate"
                  type="date"
                  {...register('contractDate')}
                />
              </div>
              <div>
                <Label htmlFor="contractExpiryDate">Действителен до</Label>
                <Input
                  id="contractExpiryDate"
                  type="date"
                  {...register('contractExpiryDate')}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="contactPerson">Контактное лицо</Label>
                <Input
                  id="contactPerson"
                  {...register('contactPerson')}
                  placeholder="Иванов И.И."
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Телефон</Label>
                <Input
                  id="contactPhone"
                  {...register('contactPhone')}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...register('contactEmail')}
                  placeholder="contact@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Примечания</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Дополнительная информация о контрагенте"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {contractor ? 'Сохранить' : 'Добавить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
