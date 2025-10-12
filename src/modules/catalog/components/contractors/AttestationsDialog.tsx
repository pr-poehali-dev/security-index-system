import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  INDUSTRIAL_SAFETY_AREAS,
  ENERGY_SAFETY_AREAS,
  LABOR_SAFETY_AREAS,
  ECOLOGY_AREAS,
} from '@/lib/constants';
import Icon from '@/components/ui/icon';
import { useContractorsStore } from '../../stores/contractorsStore';
import {
  ContractorEmployee,
  ContractorEmployeeAttestation,
  AttestationFormData,
  AttestationStatus,
} from '../../types/contractors';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AttestationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: ContractorEmployee;
  onClose?: () => void;
}

const AttestationsDialog = ({
  open,
  onOpenChange,
  employee,
  onClose,
}: AttestationsDialogProps) => {
  const { attestations, loading, fetchAttestations, createAttestation, deleteAttestation } =
    useContractorsStore();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<AttestationFormData>({
    employeeId: '',
    attestationArea: '',
    certificateNumber: '',
    issueDate: '',
    expiryDate: '',
    issuingAuthority: '',
    documentFileUrl: '',
  });

  useEffect(() => {
    if (employee && open) {
      fetchAttestations(employee.id);
      setFormData({
        ...formData,
        employeeId: employee.id,
      });
    }
  }, [employee, open, fetchAttestations]);

  const allAreas = [
    ...INDUSTRIAL_SAFETY_AREAS,
    ...ENERGY_SAFETY_AREAS,
    ...LABOR_SAFETY_AREAS,
    ...ECOLOGY_AREAS,
  ];

  const getStatusBadge = (status: AttestationStatus) => {
    const variants: Record<
      AttestationStatus,
      { label: string; variant: 'default' | 'secondary' | 'destructive' }
    > = {
      valid: { label: 'Действует', variant: 'default' },
      expiring: { label: 'Истекает', variant: 'secondary' },
      expired: { label: 'Истекла', variant: 'destructive' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    return Math.floor((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    await createAttestation(formData);
    setIsAdding(false);
    setFormData({
      employeeId: employee.id,
      attestationArea: '',
      certificateNumber: '',
      issueDate: '',
      expiryDate: '',
      issuingAuthority: '',
      documentFileUrl: '',
    });
    fetchAttestations(employee.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту аттестацию?')) {
      await deleteAttestation(id);
      if (employee) {
        fetchAttestations(employee.id);
      }
    }
  };

  const handleClose = () => {
    setIsAdding(false);
    onOpenChange(false);
    onClose?.();
  };

  const getAreaName = (code: string) => {
    const area = allAreas.find((a) => a.code === code);
    return area ? `${area.code} - ${area.name}` : code;
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Аттестации сотрудника</DialogTitle>
          <DialogDescription>
            {employee.fullName} ({employee.position || 'Должность не указана'})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="w-full">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить аттестацию
            </Button>
          )}

          {isAdding && (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="attestationArea">
                        Область аттестации <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.attestationArea}
                        onValueChange={(value) =>
                          setFormData({ ...formData, attestationArea: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите область" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2 font-semibold text-xs text-muted-foreground">
                            Промышленная безопасность
                          </div>
                          {INDUSTRIAL_SAFETY_AREAS.map((area) => (
                            <SelectItem key={area.code} value={area.code}>
                              {area.code} - {area.name}
                            </SelectItem>
                          ))}
                          <div className="p-2 font-semibold text-xs text-muted-foreground mt-2">
                            Энергобезопасность
                          </div>
                          {ENERGY_SAFETY_AREAS.map((area) => (
                            <SelectItem key={area.code} value={area.code}>
                              {area.code} - {area.name}
                            </SelectItem>
                          ))}
                          <div className="p-2 font-semibold text-xs text-muted-foreground mt-2">
                            Охрана труда
                          </div>
                          {LABOR_SAFETY_AREAS.map((area) => (
                            <SelectItem key={area.code} value={area.code}>
                              {area.code} - {area.name}
                            </SelectItem>
                          ))}
                          <div className="p-2 font-semibold text-xs text-muted-foreground mt-2">
                            Экология
                          </div>
                          {ECOLOGY_AREAS.map((area) => (
                            <SelectItem key={area.code} value={area.code}>
                              {area.code} - {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certificateNumber">Номер сертификата</Label>
                      <Input
                        id="certificateNumber"
                        value={formData.certificateNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, certificateNumber: e.target.value })
                        }
                        placeholder="АБ-12345"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="issuingAuthority">Орган выдачи</Label>
                      <Input
                        id="issuingAuthority"
                        value={formData.issuingAuthority}
                        onChange={(e) =>
                          setFormData({ ...formData, issuingAuthority: e.target.value })
                        }
                        placeholder="Ростехнадзор"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="issueDate">
                        Дата выдачи <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="issueDate"
                        type="date"
                        required
                        value={formData.issueDate}
                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">
                        Действительна до <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        required
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="documentFileUrl">Ссылка на документ</Label>
                      <Input
                        id="documentFileUrl"
                        type="url"
                        value={formData.documentFileUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, documentFileUrl: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading && <Icon name="Loader2" className="mr-2 animate-spin" size={16} />}
                      Добавить
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                      Отмена
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Icon name="Loader2" className="animate-spin" size={32} />
            </div>
          ) : attestations.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Icon name="Award" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Нет добавленных аттестаций</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {attestations.map((attestation) => {
                const daysLeft = getDaysUntilExpiry(attestation.expiryDate);
                return (
                  <Card key={attestation.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon name="Award" size={18} className="text-primary" />
                            <h4 className="font-semibold">
                              {getAreaName(attestation.attestationArea)}
                            </h4>
                            {getStatusBadge(attestation.status)}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {attestation.certificateNumber && (
                              <div className="flex items-center gap-2">
                                <Icon name="FileText" size={14} className="text-muted-foreground" />
                                <span className="text-muted-foreground">Номер:</span>
                                <span className="font-medium">{attestation.certificateNumber}</span>
                              </div>
                            )}

                            {attestation.issuingAuthority && (
                              <div className="flex items-center gap-2">
                                <Icon name="Building" size={14} className="text-muted-foreground" />
                                <span className="text-muted-foreground">Орган:</span>
                                <span>{attestation.issuingAuthority}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <Icon name="Calendar" size={14} className="text-muted-foreground" />
                              <span className="text-muted-foreground">Выдана:</span>
                              <span>
                                {format(new Date(attestation.issueDate), 'dd.MM.yyyy', {
                                  locale: ru,
                                })}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Icon
                                name="CalendarCheck"
                                size={14}
                                className={
                                  attestation.status === 'expired'
                                    ? 'text-red-600'
                                    : attestation.status === 'expiring'
                                    ? 'text-orange-600'
                                    : 'text-muted-foreground'
                                }
                              />
                              <span className="text-muted-foreground">Действительна до:</span>
                              <span
                                className={
                                  attestation.status === 'expired'
                                    ? 'text-red-600 font-medium'
                                    : attestation.status === 'expiring'
                                    ? 'text-orange-600 font-medium'
                                    : ''
                                }
                              >
                                {format(new Date(attestation.expiryDate), 'dd.MM.yyyy', {
                                  locale: ru,
                                })}
                                {daysLeft > 0 && daysLeft <= 90 && (
                                  <span className="ml-2 text-xs">
                                    ({daysLeft} {daysLeft === 1 ? 'день' : 'дней'})
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          {attestation.documentFileUrl && (
                            <div className="pt-2">
                              <a
                                href={attestation.documentFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Icon name="ExternalLink" size={12} />
                                Открыть документ
                              </a>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(attestation.id)}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttestationsDialog;
