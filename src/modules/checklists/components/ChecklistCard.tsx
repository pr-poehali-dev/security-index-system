import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { Checklist } from '@/types';

interface ChecklistCardProps {
  checklist: Checklist;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'fire_safety': return 'Flame';
    case 'equipment': return 'Cog';
    case 'ppe': return 'ShieldCheck';
    default: return 'FileText';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'fire_safety': return 'Пожарная безопасность';
    case 'equipment': return 'Оборудование';
    case 'ppe': return 'СИЗ';
    default: return category;
  }
};

export default function ChecklistCard({ checklist }: ChecklistCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Icon name={getCategoryIcon(checklist.category)} className="text-blue-600 mt-1" size={24} />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{checklist.name}</h3>
            <Badge variant="outline">{getCategoryLabel(checklist.category)}</Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Всего пунктов:</span>
            <span className="font-medium">{checklist.items.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Критических:</span>
            <span className="font-medium text-red-600">
              {checklist.items.filter(i => i.criticalItem).length}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {checklist.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-start gap-2 text-sm">
              <Icon 
                name={item.criticalItem ? "AlertCircle" : "Circle"} 
                size={14} 
                className={item.criticalItem ? "text-red-500 mt-0.5" : "text-gray-400 mt-0.5"} 
              />
              <span className="text-gray-700 line-clamp-1">{item.question}</span>
            </div>
          ))}
          {checklist.items.length > 3 && (
            <p className="text-xs text-gray-500 pl-6">
              +{checklist.items.length - 3} ещё
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1">
            <Icon name="Eye" className="mr-2" size={14} />
            Просмотр
          </Button>
          <Button size="sm" variant="secondary">
            <Icon name="Play" className="mr-2" size={14} />
            Провести
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
