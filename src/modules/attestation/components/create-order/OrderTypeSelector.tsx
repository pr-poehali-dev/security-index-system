import Icon, { type IconName } from '@/components/ui/icon';
import { Label } from '@/components/ui/label';

interface OrderType {
  value: string;
  label: string;
  icon: IconName;
  color: string;
  description: string;
}

interface OrderTypeSelectorProps {
  orderTypes: OrderType[];
  selectedType: string;
  onSelectType: (type: string) => void;
}

export default function OrderTypeSelector({ orderTypes, selectedType, onSelectType }: OrderTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Выберите тип приказа</Label>
        <p className="text-sm text-muted-foreground mb-3">
          После создания приказа вы сможете направить сотрудников в УЦ, СДО, Ростехнадзор или на внутреннюю аттестацию
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {orderTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onSelectType(type.value)}
            className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
              selectedType === type.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${type.color}`}>
                <Icon name={type.icon} size={20} />
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">{type.label}</div>
                <div className="text-xs text-muted-foreground">
                  {type.description}
                </div>
              </div>
              {selectedType === type.value && (
                <Icon name="CheckCircle2" size={20} className="text-primary" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}