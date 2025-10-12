import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
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
  const { toast } = useToast();

  const [isValidatingTenant, setIsValidatingTenant] = useState(false);
  const [tenantValidationError, setTenantValidationError] = useState<string>('');
  const [validatedTenantInfo, setValidatedTenantInfo] = useState<{ name: string; inn?: string } | null>(null);

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

  useEffect(() => {
    if (contractorTenantId && contractorTenantId.trim()) {
      validateTenantId(contractorTenantId.trim());
    } else {
      setTenantValidationError('');
      setValidatedTenantInfo(null);
    }
  }, [contractorTenantId]);

  const validateTenantId = async (tenantId: string) => {
    if (tenantId === user?.tenantId) {
      setTenantValidationError('Нельзя указать ID своей организации');
      setValidatedTenantInfo(null);
      return;
    }

    setIsValidatingTenant(true);
    setTenantValidationError('');
    setValidatedTenantInfo(null);

    try {
      const mockTenants: Record<string, { name: string; inn?: string; modules: string[] }> = {
        'tenant-training-center-001': { name: 'АНО ДПО "Профессионал"', inn: '7701234567', modules: ['training-center'] },
        'tenant-training-center-002': { name: 'ООО "Учебный Центр Безопасности"', inn: '7702345678', modules: ['training-center'] },
        'tenant-production-001': { name: 'ООО "Производственная компания"', inn: '7703456789', modules: ['attestation'] },
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      const tenant = mockTenants[tenantId];
      if (!tenant) {
        setTenantValidationError('Организация с таким ID не найдена в системе');
      } else if (type === 'training_center' && !tenant.modules.includes('training-center')) {
        setTenantValidationError('Указанная организация не является учебным центром');
      } else {
        setValidatedTenantInfo({ name: tenant.name, inn: tenant.inn });
        setValue('contractorName', tenant.name);
        if (tenant.inn) {
          setValue('contractorInn', tenant.inn);
        }
      }
    } catch (error) {
      setTenantValidationError('Ошибка проверки ID организации');
    } finally {
      setIsValidatingTenant(false);
    }
  };

  const onSubmit = (data: FormData) => {
    if (!user?.tenantId) return;

    if (data.contractorTenantId && tenantValidationError) {
      toast({ 
        title: 'Ошибка валидации', 
        description: tenantValidationError,
        variant: 'destructive' 
      });
      return;
    }

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
    setTenantValidationError('');
    setValidatedTenantInfo(null);
    onOpenChange(false);
  };

  const toggleService = (service: ContractorServiceType) => {
    const newServices = services.includes(service)
      ? services.filter(s => s !== service)
      : [...services, service];
    setValue('services', newServices);
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

            <div>
              <Label htmlFor="contractorTenantId">ID организации в системе (опционально)</Label>
              <div className="relative">
                <Input
                  id="contractorTenantId"
                  {...register('contractorTenantId')}
                  placeholder="Введите ID тенанта для автоматической интеграции"
                  className={tenantValidationError ? 'border-destructive' : validatedTenantInfo ? 'border-green-500' : ''}
                />
                {isValidatingTenant && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
              {tenantValidationError && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <span>✕</span> {tenantValidationError}
                </p>
              )}
              {validatedTenantInfo && !tenantValidationError && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <span>✓</span> Найдена организация: {validatedTenantInfo.name}
                  {validatedTenantInfo.inn && ` (ИНН: ${validatedTenantInfo.inn})`}
                </p>
              )}
              {!contractorTenantId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Если контрагент зарегистрирован в системе, укажите его ID для автоматической передачи заявок
                </p>
              )}
            </div>

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