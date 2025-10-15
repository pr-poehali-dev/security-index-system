import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useAttestationOrdersStore } from '@/stores/attestationOrdersStore';
import { useCertificationStore } from '@/stores/certificationStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { getAreasForCategory, certificationCategories } from '@/stores/mockData/certificationAreas';
import type { Personnel, AttestationOrderType, AttestationOrderPersonnel, AttestationRequiredDocument } from '@/types';

interface CreateAttestationOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  preselectedEmployeeIds?: string[];
  preselectedType?: string;
  preSelectedPersonnel?: Personnel[];
}

export default function CreateAttestationOrderDialog({
  open,
  onOpenChange,
  onSuccess,
  preselectedEmployeeIds = [],
  preselectedType,
  preSelectedPersonnel = []
}: CreateAttestationOrderDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { addOrder } = useAttestationOrdersStore();
  const { certifications } = useCertificationStore();
  const organizations = useSettingsStore((state) => state.organizations);
  const allPersonnel = useSettingsStore((state) => state.personnel);
  const certificationAreas = useSettingsStore((state) => state.certificationAreas);
  const { toast } = useToast();

  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const getInitialType = (): AttestationOrderType => {
    if (!preselectedType) return 'rostekhnadzor';
    const typeMap: Record<string, AttestationOrderType> = {
      'sdo': 'sdo',
      'training_center': 'training_center',
      'internal_attestation': 'internal',
      'rostechnadzor': 'rostekhnadzor'
    };
    return typeMap[preselectedType] || 'rostekhnadzor';
  };

  const [attestationType, setAttestationType] = useState<AttestationOrderType>(getInitialType());
  const [certificationAreaCode, setCertificationAreaCode] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [location, setLocation] = useState('');
  const [commissionMembers, setCommissionMembers] = useState<string[]>([]);
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>(
    preselectedEmployeeIds.length > 0 ? preselectedEmployeeIds : preSelectedPersonnel.map(p => p.id)
  );
  const [notes, setNotes] = useState('');

  const userOrganizations = useMemo(() => {
    if (!user?.tenantId) return [];
    return organizations.filter(org => org.tenantId === user.tenantId);
  }, [user?.tenantId, organizations]);

  const availablePersonnel = useMemo(() => {
    if (!organizationId) return [];
    return allPersonnel.filter(p => 
      p.organizationId === organizationId && p.status === 'active'
    );
  }, [organizationId, allPersonnel]);

  const allAreas = useMemo(() => {
    const areas: Array<{ code: string; name: string; category: string }> = [];
    certificationCategories.forEach(category => {
      const categoryAreas = getAreasForCategory(category);
      categoryAreas.forEach(area => {
        areas.push({
          code: area,
          name: area,
          category
        });
      });
    });
    return areas;
  }, []);

  const selectedArea = allAreas.find(a => a.code === certificationAreaCode);

  const getPersonnelCertificates = (personnelId: string) => {
    return certifications.filter(c => 
      c.personnelId === personnelId && 
      c.area.includes(certificationAreaCode)
    );
  };

  const buildOrderPersonnel = (): AttestationOrderPersonnel[] => {
    return selectedPersonnelIds.map(personnelId => {
      const person = availablePersonnel.find(p => p.id === personnelId);
      if (!person) return null;

      const certs = getPersonnelCertificates(personnelId);
      const requiredDocuments: AttestationRequiredDocument[] = [];

      certs.forEach(cert => {
        if (cert.documents && cert.documents.length > 0) {
          cert.documents.forEach(doc => {
            requiredDocuments.push({
              documentType: doc.type === 'certificate' ? 'training_certificate' : 'other',
              documentName: doc.fileName,
              certificateId: cert.id,
              fileId: doc.id,
              fileUrl: doc.fileUrl,
              status: 'attached'
            });
          });
        }
      });

      return {
        personnelId: person.id,
        fullName: `${person.personId}`,
        position: person.positionId,
        requiredDocuments
      };
    }).filter(Boolean) as AttestationOrderPersonnel[];
  };

  const handleSubmit = () => {
    if (!orderNumber || !orderDate || !certificationAreaCode || !organizationId || selectedPersonnelIds.length === 0) {
      toast({
        title: 'Заполните обязательные поля',
        description: 'Укажите номер приказа, дату, область аттестации, организацию и выберите сотрудников',
        variant: 'destructive'
      });
      return;
    }

    const orderPersonnel = buildOrderPersonnel();

    const newOrder = addOrder({
      tenantId: user?.tenantId || '',
      organizationId,
      orderNumber,
      orderDate,
      attestationType,
      certificationAreaCode,
      certificationAreaName: selectedArea?.name || '',
      personnel: orderPersonnel,
      scheduledDate: scheduledDate || undefined,
      commissionMembers: attestationType === 'internal_commission' && commissionMembers.length > 0 
        ? commissionMembers 
        : undefined,
      location: location || undefined,
      status: 'draft',
      notes: notes || undefined,
      createdBy: user?.id || 'unknown'
    });

    toast({
      title: 'Приказ создан',
      description: `Приказ №${orderNumber} успешно создан`,
    });

    onSuccess?.();
    onOpenChange(false);
  };

  const togglePersonnel = (personnelId: string) => {
    setSelectedPersonnelIds(prev =>
      prev.includes(personnelId)
        ? prev.filter(id => id !== personnelId)
        : [...prev, personnelId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="FileText" size={24} />
            Создать приказ на аттестацию
          </DialogTitle>
          <DialogDescription>
            Автоматическое заполнение документов на основе удостоверений сотрудников
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Номер приказа *</Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="ПР-001/2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderDate">Дата приказа *</Label>
              <Input
                id="orderDate"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Организация *</Label>
              <Select value={organizationId} onValueChange={setOrganizationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите организацию" />
                </SelectTrigger>
                <SelectContent>
                  {userOrganizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attestationType">Тип приказа *</Label>
              <Select value={attestationType} onValueChange={(v) => setAttestationType(v as AttestationOrderType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sdo">О подготовке в СДО Интеллектуальная система</SelectItem>
                  <SelectItem value="training_center">О подготовке в учебный центр</SelectItem>
                  <SelectItem value="internal">О аттестации в ЕПТ организации</SelectItem>
                  <SelectItem value="rostekhnadzor">О направлении на аттестацию в Ростехнадзор</SelectItem>
                  <SelectItem value="internal_commission">Комиссия организации (устаревший)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificationArea">Область аттестации *</Label>
            <Select value={certificationAreaCode} onValueChange={setCertificationAreaCode}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите область" />
              </SelectTrigger>
              <SelectContent>
                {allAreas.map((area) => (
                  <SelectItem key={area.code} value={area.code}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {attestationType === 'internal_commission' && (
            <div className="space-y-2">
              <Label htmlFor="commissionMembers">Состав комиссии</Label>
              <Textarea
                id="commissionMembers"
                value={commissionMembers.join('\n')}
                onChange={(e) => setCommissionMembers(e.target.value.split('\n').filter(Boolean))}
                placeholder="Введите членов комиссии (каждый с новой строки)"
                rows={3}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Планируемая дата аттестации</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Место проведения</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Адрес или помещение"
              />
            </div>
          </div>

          {organizationId && (
            <div className="space-y-3">
              <Label>Сотрудники для аттестации *</Label>
              <div className="rounded-lg border p-4 space-y-2 max-h-[300px] overflow-y-auto">
                {availablePersonnel.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Нет доступных сотрудников в выбранной организации
                  </p>
                ) : (
                  availablePersonnel.map((person) => {
                    const certs = getPersonnelCertificates(person.id);
                    const hasCerts = certs.length > 0;
                    
                    return (
                      <div
                        key={person.id}
                        className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent"
                      >
                        <Checkbox
                          checked={selectedPersonnelIds.includes(person.id)}
                          onCheckedChange={() => togglePersonnel(person.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{person.personId}</span>
                            {hasCerts && (
                              <Badge variant="secondary" className="text-xs">
                                <Icon name="Award" size={12} className="mr-1" />
                                {certs.length} удост.
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{person.positionId}</p>
                          {hasCerts && (
                            <div className="mt-2 space-y-1">
                              {certs.slice(0, 2).map((cert) => (
                                <div key={cert.id} className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Icon name="Check" size={12} className="text-green-600" />
                                  {cert.certificateNumber} — {cert.area}
                                </div>
                              ))}
                              {certs.length > 2 && (
                                <div className="text-xs italic text-muted-foreground">
                                  + ещё {certs.length - 2}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {selectedPersonnelIds.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Выбрано: {selectedPersonnelIds.length} сотрудников
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительная информация"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Icon name="Check" size={18} />
            Создать приказ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}