import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAttestationStore } from '@/stores/certificationStore';
import { useAuthStore } from '@/stores/authStore';

export default function ImportAttestationsDialog() {
  const [open, setOpen] = useState(false);
  const [protocolNumber, setProtocolNumber] = useState('');
  const [protocolDate, setProtocolDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState<'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology'>('industrial_safety');
  const [area, setArea] = useState('');
  const [attestationType, setAttestationType] = useState<'rostechnadzor' | 'company_commission'>('rostechnadzor');
  const [notes, setNotes] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [importMode, setImportMode] = useState<'single' | 'bulk'>('single');
  
  const { toast } = useToast();
  const { addAttestation, importAttestations } = useAttestationStore();
  const user = useAuthStore((state) => state.user);

  const handleSingleImport = () => {
    if (!protocolNumber || !protocolDate || !expiryDate || !area) {
      toast({ 
        title: 'Ошибка', 
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    addAttestation({
      personnelId: 'personnel-1',
      tenantId: user?.tenantId || '',
      category,
      area,
      protocolNumber,
      protocolDate,
      expiryDate,
      attestationType,
      result: 'passed',
      notes
    });

    toast({ 
      title: 'Протокол импортирован', 
      description: `Протокол ${protocolNumber} успешно добавлен` 
    });

    resetForm();
    setOpen(false);
  };

  const handleBulkImport = () => {
    try {
      const data = JSON.parse(jsonInput);
      const attestations = Array.isArray(data) ? data : [data];
      
      const validAttestations = attestations.map((att: any) => ({
        personnelId: att.personnelId || 'personnel-1',
        tenantId: user?.tenantId || '',
        category: att.category || 'industrial_safety',
        area: att.area,
        protocolNumber: att.protocolNumber,
        protocolDate: att.protocolDate,
        expiryDate: att.expiryDate,
        attestationType: att.attestationType || 'rostechnadzor',
        result: att.result || 'passed',
        notes: att.notes || ''
      }));

      importAttestations(validAttestations);

      toast({ 
        title: 'Импорт завершен', 
        description: `Импортировано протоколов: ${validAttestations.length}` 
      });

      resetForm();
      setOpen(false);
    } catch (error) {
      toast({ 
        title: 'Ошибка импорта', 
        description: 'Проверьте формат JSON данных',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setProtocolNumber('');
    setProtocolDate('');
    setExpiryDate('');
    setCategory('industrial_safety');
    setArea('');
    setAttestationType('rostechnadzor');
    setNotes('');
    setJsonInput('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Icon name="Upload" size={16} className="mr-2" />
          Импорт протоколов аттестации
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Импорт протоколов аттестации</DialogTitle>
          <DialogDescription>
            Загрузите протоколы аттестации из системы Ростехнадзора или комиссии организации
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button 
              variant={importMode === 'single' ? 'default' : 'outline'}
              onClick={() => setImportMode('single')}
              className="flex-1"
            >
              Один протокол
            </Button>
            <Button 
              variant={importMode === 'bulk' ? 'default' : 'outline'}
              onClick={() => setImportMode('bulk')}
              className="flex-1"
            >
              Массовый импорт
            </Button>
          </div>

          {importMode === 'single' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="protocolNumber">Номер протокола *</Label>
                <Input
                  id="protocolNumber"
                  value={protocolNumber}
                  onChange={(e) => setProtocolNumber(e.target.value)}
                  placeholder="ПБ-123/2023"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="protocolDate">Дата протокола *</Label>
                  <Input
                    id="protocolDate"
                    type="date"
                    value={protocolDate}
                    onChange={(e) => setProtocolDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Действителен до *</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Категория *</Label>
                <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="industrial_safety">Промышленная безопасность</SelectItem>
                    <SelectItem value="energy_safety">Энергобезопасность</SelectItem>
                    <SelectItem value="labor_safety">Охрана труда</SelectItem>
                    <SelectItem value="ecology">Экология</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Область аттестации *</Label>
                <Input
                  id="area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="А.1 Основы промышленной безопасности"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attestationType">Тип аттестации *</Label>
                <Select value={attestationType} onValueChange={(val: any) => setAttestationType(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rostechnadzor">Ростехнадзор</SelectItem>
                    <SelectItem value="company_commission">Комиссия организации</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jsonInput">JSON данные</Label>
                <Textarea
                  id="jsonInput"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`[\n  {\n    "personnelId": "personnel-1",\n    "category": "industrial_safety",\n    "area": "А.1",\n    "protocolNumber": "ПБ-123/2023",\n    "protocolDate": "2023-01-20",\n    "expiryDate": "2028-01-20",\n    "attestationType": "rostechnadzor",\n    "result": "passed"\n  }\n]`}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Формат импорта:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>personnelId - ID сотрудника</li>
                  <li>category - категория (industrial_safety, energy_safety, labor_safety, ecology)</li>
                  <li>area - область аттестации</li>
                  <li>protocolNumber - номер протокола</li>
                  <li>protocolDate - дата протокола (YYYY-MM-DD)</li>
                  <li>expiryDate - срок действия (YYYY-MM-DD)</li>
                  <li>attestationType - тип (rostechnadzor или company_commission)</li>
                  <li>result - результат (passed или failed)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={importMode === 'single' ? handleSingleImport : handleBulkImport}>
            <Icon name="Upload" size={16} className="mr-2" />
            Импортировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
