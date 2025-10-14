import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface TypeOption {
  value: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

interface TypeSelectionStepProps {
  options: TypeOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function TypeSelectionStep({ options, selected, onSelect }: TypeSelectionStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {options.map((option) => (
        <Card
          key={option.value}
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            selected === option.value && 'ring-2 ring-primary'
          )}
          onClick={() => onSelect(option.value)}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={cn('p-4 rounded-full', option.color)}>
                <Icon name={option.icon} size={32} />
              </div>
              <h3 className="font-semibold text-lg">{option.label}</h3>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
