import Icon, { type IconName } from '@/components/ui/icon';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface OrderType {
  value: string;
  label: string;
  icon: IconName;
  color: string;
  description: string;
}

interface OrderBasicInfoFormProps {
  selectedType: OrderType | undefined;
  orderNumber: string;
  orderDate: string;
  orderTitle: string;
  orderDescription: string;
  onOrderNumberChange: (value: string) => void;
  onOrderDateChange: (value: string) => void;
  onOrderTitleChange: (value: string) => void;
  onOrderDescriptionChange: (value: string) => void;
}

export default function OrderBasicInfoForm({
  selectedType,
  orderNumber,
  orderDate,
  orderTitle,
  orderDescription,
  onOrderNumberChange,
  onOrderDateChange,
  onOrderTitleChange,
  onOrderDescriptionChange,
}: OrderBasicInfoFormProps) {
  return (
    <div className="space-y-4">
      {selectedType && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <div className={`p-2 rounded-lg ${selectedType.color}`}>
            <Icon name={selectedType.icon} size={18} />
          </div>
          <div>
            <div className="text-sm font-medium">{selectedType.label}</div>
            <div className="text-xs text-muted-foreground">Выбранный тип приказа</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="orderNumber">Номер приказа *</Label>
          <Input
            id="orderNumber"
            placeholder="15-А"
            value={orderNumber}
            onChange={(e) => onOrderNumberChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="orderDate">Дата приказа *</Label>
          <Input
            id="orderDate"
            type="date"
            value={orderDate}
            onChange={(e) => onOrderDateChange(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="orderTitle">Название приказа *</Label>
        <Input
          id="orderTitle"
          placeholder="О проведении аттестации..."
          value={orderTitle}
          onChange={(e) => onOrderTitleChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="orderDescription">Описание (необязательно)</Label>
        <Textarea
          id="orderDescription"
          placeholder="Дополнительная информация о приказе..."
          value={orderDescription}
          onChange={(e) => onOrderDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}