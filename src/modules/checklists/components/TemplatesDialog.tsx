import { useState } from 'react';
import { useChecklistsStore } from '@/stores/checklistsStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { CHECKLIST_TEMPLATES } from '../data/templates';

interface TemplatesDialogProps {
  open: boolean;
  onClose: () => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'fire_safety': return 'Flame';
    case 'equipment': return 'Cog';
    case 'ppe': return 'ShieldCheck';
    case 'workplace': return 'Building2';
    case 'electrical': return 'Zap';
    case 'chemical': return 'FlaskConical';
    default: return 'FileText';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'fire_safety': return 'Пожарная безопасность';
    case 'equipment': return 'Оборудование';
    case 'ppe': return 'СИЗ';
    case 'workplace': return 'Рабочие места';
    case 'electrical': return 'Электробезопасность';
    case 'chemical': return 'Химическая безопасность';
    default: return 'Другое';
  }
};

export default function TemplatesDialog({ open, onClose }: TemplatesDialogProps) {
  const { addChecklist } = useChecklistsStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = CHECKLIST_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUseTemplate = (template: typeof CHECKLIST_TEMPLATES[0]) => {
    addChecklist({
      tenantId: 'tenant-1',
      name: template.name,
      category: template.category,
      items: template.items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        ...item
      }))
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Шаблоны чек-листов</DialogTitle>
          <DialogDescription>
            Выберите готовый шаблон для быстрого создания чек-листа
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Поиск шаблонов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Icon 
                        name={getCategoryIcon(template.category)} 
                        className="text-blue-600 mt-1" 
                        size={24} 
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                        <Badge variant="outline" className="mb-2">
                          {getCategoryLabel(template.category)}
                        </Badge>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Вопросов:</span>
                        <span className="font-medium">{template.items.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Критических:</span>
                        <span className="font-medium text-red-600">
                          {template.items.filter(i => i.criticalItem).length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      {template.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <Icon 
                            name={item.criticalItem ? "AlertCircle" : "Circle"} 
                            size={12} 
                            className={item.criticalItem ? "text-red-500 mt-0.5" : "text-gray-400 mt-0.5"}
                          />
                          <span className="line-clamp-1">{item.question}</span>
                        </div>
                      ))}
                      {template.items.length > 3 && (
                        <p className="text-xs text-gray-500 pl-5">
                          +{template.items.length - 3} ещё
                        </p>
                      )}
                    </div>

                    <Button 
                      onClick={() => handleUseTemplate(template)}
                      className="w-full gap-2"
                      size="sm"
                    >
                      <Icon name="Plus" size={14} />
                      Использовать шаблон
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Icon name="Search" className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500">Шаблоны не найдены</p>
                <p className="text-sm text-gray-400 mt-2">Попробуйте изменить запрос</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
