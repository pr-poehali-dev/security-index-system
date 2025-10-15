import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useCatalogStore } from '@/stores/catalogStore';
import type { IndustrialObject, ObjectType, HazardClass, ObjectStatus } from '@/types/catalog';
import { HAZARD_CLASS_OPTIONS } from '@/constants/hazardClass';

interface ObjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  object?: IndustrialObject;
  mode: 'create' | 'edit';
}

interface FormData {
  name: string;
  registrationNumber: string;
  type: ObjectType;
  category: string;
  hazardClass: HazardClass | '';
  organizationId: string;
  commissioningDate: string;
  status: ObjectStatus;
  address: string;
  latitude: string;
  longitude: string;
  responsiblePerson: string;
  nextExpertiseDate: string;
  nextDiagnosticDate: string;
  nextTestDate: string;
  description: string;
}

interface FormErrors {
  name?: string;
  registrationNumber?: string;
  type?: string;
  organizationId?: string;
  commissioningDate?: string;
  address?: string;
  responsiblePerson?: string;
}

const initialFormData: FormData = {
  name: '',
  registrationNumber: '',
  type: 'opo',
  category: '',
  hazardClass: '',
  organizationId: '',
  commissioningDate: '',
  status: 'active',
  address: '',
  latitude: '',
  longitude: '',
  responsiblePerson: '',
  nextExpertiseDate: '',
  nextDiagnosticDate: '',
  nextTestDate: '',
  description: ''
};

export default function ObjectFormModal({ open, onOpenChange, object, mode }: ObjectFormModalProps) {
  const { organizations, addObject, updateObject } = useCatalogStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && object && mode === 'edit') {
      setFormData({
        name: object.name,
        registrationNumber: object.registrationNumber,
        type: object.type,
        category: object.category || '',
        hazardClass: object.hazardClass || '',
        organizationId: object.organizationId,
        commissioningDate: object.commissioningDate,
        status: object.status,
        address: object.location.address,
        latitude: object.location.coordinates?.lat.toString() || '',
        longitude: object.location.coordinates?.lng.toString() || '',
        responsiblePerson: object.responsiblePerson,
        nextExpertiseDate: object.nextExpertiseDate || '',
        nextDiagnosticDate: object.nextDiagnosticDate || '',
        nextTestDate: object.nextTestDate || '',
        description: object.description || ''
      });
    } else if (open && mode === 'create') {
      setFormData(initialFormData);
      setErrors({});
    }
  }, [open, object, mode]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Название должно быть не менее 3 символов';
    }

    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Регистрационный номер обязателен';
    } else if (!/^[A-ZА-Я0-9-]+$/i.test(formData.registrationNumber)) {
      newErrors.registrationNumber = 'Только буквы, цифры и дефис';
    }

    if (!formData.type) {
      newErrors.type = 'Выберите тип объекта';
    }

    if (!formData.organizationId) {
      newErrors.organizationId = 'Выберите организацию';
    }

    if (!formData.commissioningDate) {
      newErrors.commissioningDate = 'Дата ввода в эксплуатацию обязательна';
    } else {
      const commDate = new Date(formData.commissioningDate);
      if (commDate > new Date()) {
        newErrors.commissioningDate = 'Дата не может быть в будущем';
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Адрес обязателен';
    } else if (formData.address.length < 10) {
      newErrors.address = 'Адрес должен быть не менее 10 символов';
    }

    if (!formData.responsiblePerson.trim()) {
      newErrors.responsiblePerson = 'Ответственное лицо обязательно';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const objectData = {
        tenantId: 'tenant-1',
        name: formData.name.trim(),
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        type: formData.type,
        category: formData.category.trim() || undefined,
        hazardClass: formData.hazardClass || undefined,
        organizationId: formData.organizationId,
        commissioningDate: formData.commissioningDate,
        status: formData.status,
        location: {
          address: formData.address.trim(),
          coordinates: formData.latitude && formData.longitude ? {
            lat: parseFloat(formData.latitude),
            lng: parseFloat(formData.longitude)
          } : undefined
        },
        responsiblePerson: formData.responsiblePerson.trim(),
        nextExpertiseDate: formData.nextExpertiseDate || undefined,
        nextDiagnosticDate: formData.nextDiagnosticDate || undefined,
        nextTestDate: formData.nextTestDate || undefined,
        description: formData.description.trim() || undefined
      };

      if (mode === 'create') {
        addObject(objectData);
      } else if (object) {
        updateObject(object.id, objectData);
      }

      onOpenChange(false);
      setFormData(initialFormData);
      setErrors({});
    } catch (error) {
      console.error('Ошибка при сохранении объекта:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const showHazardClass = formData.type === 'opo' || formData.type === 'gts';
  const showTestDate = formData.type === 'gts';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Создание объекта' : 'Редактирование объекта'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Название <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Котельная №1"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">
                Регистрационный номер <span className="text-red-500">*</span>
              </Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => handleChange('registrationNumber', e.target.value)}
                placeholder="A-78-001234"
                className={errors.registrationNumber ? 'border-red-500' : ''}
              />
              {errors.registrationNumber && (
                <p className="text-sm text-red-500">{errors.registrationNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Тип объекта <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opo">ОПО</SelectItem>
                  <SelectItem value="gts">ГТС</SelectItem>
                  <SelectItem value="building">Здание</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationId">
                Организация <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.organizationId}
                onValueChange={(value) => handleChange('organizationId', value)}
              >
                <SelectTrigger className={errors.organizationId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Выберите организацию" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {'  '.repeat(org.level)}{org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organizationId && (
                <p className="text-sm text-red-500">{errors.organizationId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="Получение, использование горючих веществ"
              />
            </div>

            {showHazardClass && (
              <div className="space-y-2">
                <Label htmlFor="hazardClass">Класс опасности</Label>
                <Select
                  value={formData.hazardClass}
                  onValueChange={(value) => handleChange('hazardClass', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите класс" />
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
            )}

            <div className="space-y-2">
              <Label htmlFor="commissioningDate">
                Дата ввода в эксплуатацию <span className="text-red-500">*</span>
              </Label>
              <Input
                id="commissioningDate"
                type="date"
                value={formData.commissioningDate}
                onChange={(e) => handleChange('commissioningDate', e.target.value)}
                className={errors.commissioningDate ? 'border-red-500' : ''}
              />
              {errors.commissioningDate && (
                <p className="text-sm text-red-500">{errors.commissioningDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value as ObjectStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="conservation">На консервации</SelectItem>
                  <SelectItem value="liquidated">Ликвидирован</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsiblePerson">
                Ответственное лицо <span className="text-red-500">*</span>
              </Label>
              <Input
                id="responsiblePerson"
                value={formData.responsiblePerson}
                onChange={(e) => handleChange('responsiblePerson', e.target.value)}
                placeholder="Иванов И.И."
                className={errors.responsiblePerson ? 'border-red-500' : ''}
              />
              {errors.responsiblePerson && (
                <p className="text-sm text-red-500">{errors.responsiblePerson}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextExpertiseDate">Дата следующей ЭПБ</Label>
              <Input
                id="nextExpertiseDate"
                type="date"
                value={formData.nextExpertiseDate}
                onChange={(e) => handleChange('nextExpertiseDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextDiagnosticDate">Дата следующей диагностики</Label>
              <Input
                id="nextDiagnosticDate"
                type="date"
                value={formData.nextDiagnosticDate}
                onChange={(e) => handleChange('nextDiagnosticDate', e.target.value)}
              />
            </div>

            {showTestDate && (
              <div className="space-y-2">
                <Label htmlFor="nextTestDate">Дата следующих испытаний</Label>
                <Input
                  id="nextTestDate"
                  type="date"
                  value={formData.nextTestDate}
                  onChange={(e) => handleChange('nextTestDate', e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Адрес <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="г. Санкт-Петербург, ул. Тепловая, 5, корп. 1"
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Широта (опционально)</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleChange('latitude', e.target.value)}
                placeholder="59.9342802"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Долгота (опционально)</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleChange('longitude', e.target.value)}
                placeholder="30.3350986"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Дополнительная информация об объекте"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" className="mr-2" size={16} />
                  {mode === 'create' ? 'Создать' : 'Сохранить'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}