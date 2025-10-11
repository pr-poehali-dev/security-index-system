import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import {
  certificationCategories,
  getAreasForCategory,
} from '@/stores/mockData';

interface AddCertificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName?: string;
}

export default function AddCertificationDialog({
  open,
  onOpenChange,
  employeeName,
}: AddCertificationDialogProps) {
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [protocolNumber, setProtocolNumber] = useState('');
  const [protocolDate, setProtocolDate] = useState('');
  const [verified, setVerified] = useState(false);

  const handleSubmit = () => {
    console.log({
      category,
      area,
      issueDate,
      expiryDate,
      protocolNumber,
      protocolDate,
      verified,
    });
    onOpenChange(false);
  };



  const showProtocolFields = category === 'Промышленная безопасность' || category === 'Энергобезопасность';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Добавить аттестацию
            {employeeName && <span className="text-muted-foreground font-normal"> — {employeeName}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Категория аттестации *</Label>
            <Select value={category} onValueChange={(val) => { setCategory(val); setArea(''); }}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {certificationCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {category && (
            <div className="space-y-2">
              <Label htmlFor="area">Область аттестации *</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger id="area">
                  <SelectValue placeholder="Выберите область" />
                </SelectTrigger>
                <SelectContent>
                  {getAreasForCategory(category).map((ar) => (
                    <SelectItem key={ar} value={ar}>
                      {ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Дата выдачи *</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Дата истечения *</Label>
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          {showProtocolFields && (
            <>
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Icon name="FileText" size={16} />
                  Данные протокола
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="protocolNumber">Номер протокола</Label>
                    <Input
                      id="protocolNumber"
                      type="text"
                      placeholder="ПБ-123/2023"
                      value={protocolNumber}
                      onChange={(e) => setProtocolNumber(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="protocolDate">Дата протокола</Label>
                    <Input
                      id="protocolDate"
                      type="date"
                      value={protocolDate}
                      onChange={(e) => setProtocolDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {protocolNumber && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 mb-1">Проверка в Ростехнадзоре</p>
                        <p className="text-blue-700">
                          После сохранения вы сможете проверить этот протокол в системе Ростехнадзора
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900">
                    <div className="flex items-center gap-3">
                      <Icon name={verified ? "CheckCircle2" : "AlertCircle"} size={20} className={verified ? "text-emerald-600" : "text-slate-400"} />
                      <Label htmlFor="verified" className="text-sm font-medium cursor-pointer">
                        Протокол проверен в реестре Ростехнадзора
                      </Label>
                    </div>
                    <Switch 
                      id="verified"
                      checked={verified}
                      onCheckedChange={setVerified}
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!category || !area || !issueDate || !expiryDate}
            >
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
