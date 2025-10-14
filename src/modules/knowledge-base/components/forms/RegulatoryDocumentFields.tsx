import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { REGULATORY_DOCUMENT_TYPES } from '@/types';
import type { RegulatoryDocumentType } from '@/types';

interface RegulatoryDocumentFieldsProps {
  regulatoryType: RegulatoryDocumentType | '';
  onRegulatoryTypeChange: (value: RegulatoryDocumentType | '') => void;
  documentNumber: string;
  onDocumentNumberChange: (value: string) => void;
  adoptionDate: string;
  onAdoptionDateChange: (value: string) => void;
  expiryDate: string;
  onExpiryDateChange: (value: string) => void;
  regulatoryStatus: 'active' | 'inactive';
  onRegulatoryStatusChange: (value: 'active' | 'inactive') => void;
}

export default function RegulatoryDocumentFields({
  regulatoryType,
  onRegulatoryTypeChange,
  documentNumber,
  onDocumentNumberChange,
  adoptionDate,
  onAdoptionDateChange,
  expiryDate,
  onExpiryDateChange,
  regulatoryStatus,
  onRegulatoryStatusChange,
}: RegulatoryDocumentFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="regulatoryType">Тип нормативного документа</Label>
        <Select value={regulatoryType} onValueChange={(v) => onRegulatoryTypeChange(v as RegulatoryDocumentType)}>
          <SelectTrigger id="regulatoryType">
            <SelectValue placeholder="Выберите тип документа" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REGULATORY_DOCUMENT_TYPES).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="documentNumber">Номер документа</Label>
        <Input
          id="documentNumber"
          value={documentNumber}
          onChange={(e) => onDocumentNumberChange(e.target.value)}
          placeholder="116-ФЗ, 782н и т.д."
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adoptionDate">Дата документа</Label>
        <Input
          id="adoptionDate"
          type="date"
          value={adoptionDate}
          onChange={(e) => onAdoptionDateChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiryDate">Действует до</Label>
        <Input
          id="expiryDate"
          type="date"
          value={expiryDate}
          onChange={(e) => onExpiryDateChange(e.target.value)}
          placeholder="Оставьте пустым, если бессрочно"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="regulatoryStatus">Статус документа</Label>
        <Select value={regulatoryStatus} onValueChange={(v) => onRegulatoryStatusChange(v as 'active' | 'inactive')}>
          <SelectTrigger id="regulatoryStatus">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Действующий</SelectItem>
            <SelectItem value="inactive">Недействующий</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
