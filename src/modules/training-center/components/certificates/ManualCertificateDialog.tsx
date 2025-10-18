import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useTrainingCenterStore } from '@/stores/trainingCenterStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { getAreasForCategory, certificationCategories } from '@/stores/mockData/certificationAreas';

interface ManualCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingCenterId: string;
}

const categoryOptions = [
  { value: 'industrial_safety', label: 'Промбезопасность' },
  { value: 'energy_safety', label: 'Энергобезопасность' },
  { value: 'labor_safety', label: 'Охрана труда' },
  { value: 'ecology', label: 'Экология' }
];

export default function ManualCertificateDialog({
  open,
  onOpenChange,
  trainingCenterId
}: ManualCertificateDialogProps) {
  const { addIssuedCertificate } = useTrainingCenterStore();
  const { personnel = [], organizations = [] } = useSettingsStore();
  
  const [formData, setFormData] = useState({
    personnelId: '',
    certificateNumber: '',
    protocolNumber: '',
    protocolDate: '',
    issueDate: '',
    expiryDate: '',
    category: 'Промышленная безопасность',
    area: '',
    issuedBy: ''
  });

  const availableAreas = formData.category 
    ? getAreasForCategory(formData.category)
    : [];
  
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [protocolFile, setProtocolFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const person = personnel.find(p => p.id === formData.personnelId);
    const organization = person?.organizationId 
      ? organizations.find(o => o.id === person.organizationId)
      : null;

    if (!person || !formData.area) {
      alert('Необходимо выбрать слушателя и область аттестации');
      return;
    }

    const categoryMap: Record<string, 'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology'> = {
      'Промышленная безопасность': 'industrial_safety',
      'Энергобезопасность': 'energy_safety',
      'Электробезопасность': 'energy_safety',
      'Работы на высоте': 'labor_safety'
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    let certificateFileUrl: string | undefined;
    let protocolFileUrl: string | undefined;

    if (certificateFile) {
      certificateFileUrl = await convertFileToBase64(certificateFile);
    }
    if (protocolFile) {
      protocolFileUrl = await convertFileToBase64(protocolFile);
    }

    addIssuedCertificate({
      trainingCenterId,
      clientTenantId: organization?.tenantId || '',
      personnelId: formData.personnelId,
      personnelName: person.fullName,
      organizationId: organization?.id,
      organizationName: organization?.name,
      organizationInn: organization?.inn,
      programId: formData.area,
      programName: formData.area,
      certificateNumber: formData.certificateNumber,
      protocolNumber: formData.protocolNumber,
      protocolDate: formData.protocolDate,
      issueDate: formData.issueDate,
      expiryDate: formData.expiryDate,
      category: categoryMap[formData.category] || 'industrial_safety',
      area: formData.area,
      certificateFileUrl,
      protocolFileUrl,
      status: 'issued',
      issuedBy: formData.issuedBy
    });

    setFormData({
      personnelId: '',
      certificateNumber: '',
      protocolNumber: '',
      protocolDate: '',
      issueDate: '',
      expiryDate: '',
      category: 'Промышленная безопасность',
      area: '',
      issuedBy: ''
    });
    setCertificateFile(null);
    setProtocolFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить удостоверение вручную</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Слушатель *</Label>
              <Select 
                value={formData.personnelId} 
                onValueChange={(value) => setFormData({ ...formData, personnelId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите слушателя" />
                </SelectTrigger>
                <SelectContent>
                  {(personnel || []).map(person => {
                    const org = person.organizationId 
                      ? organizations.find(o => o.id === person.organizationId)
                      : null;
                    return (
                      <SelectItem key={person.id} value={person.id}>
                        {person.fullName} {org && `(${org.name})`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Категория *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value: any) => setFormData({ ...formData, category: value, area: '' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {certificationCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Область аттестации (программа обучения) *</Label>
            <Select 
              value={formData.area} 
              onValueChange={(value) => setFormData({ ...formData, area: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите область аттестации" />
              </SelectTrigger>
              <SelectContent>
                {availableAreas.map(area => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Номер удостоверения *</Label>
            <Input
              value={formData.certificateNumber}
              onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
              placeholder="Например: У-12345"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Номер протокола *</Label>
              <Input
                value={formData.protocolNumber}
                onChange={(e) => setFormData({ ...formData, protocolNumber: e.target.value })}
                placeholder="Например: П-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Дата протокола *</Label>
              <Input
                type="date"
                value={formData.protocolDate}
                onChange={(e) => setFormData({ ...formData, protocolDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Дата выдачи *</Label>
              <Input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Срок действия *</Label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Выдано (кем) *</Label>
            <Input
              value={formData.issuedBy}
              onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
              placeholder="Например: Учебный центр 'Профессионал'"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Скан удостоверения</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              {certificateFile && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setCertificateFile(null)}
                >
                  <Icon name="X" size={16} />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Скан протокола</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setProtocolFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              {protocolFile && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setProtocolFile(null)}
                >
                  <Icon name="X" size={16} />
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить удостоверение
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}