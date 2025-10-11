import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MODULES } from '@/lib/constants';
import type { ModuleType } from '@/types';

interface ModulesSelectorProps {
  selectedModules: ModuleType[];
  onToggle: (moduleKey: ModuleType) => void;
  idPrefix?: string;
}

export default function ModulesSelector({ selectedModules, onToggle, idPrefix = '' }: ModulesSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Доступные модули</Label>
      <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {(Object.keys(MODULES) as ModuleType[]).map((moduleKey) => {
          const module = MODULES[moduleKey];
          const isDisabled = moduleKey === 'catalog';
          
          return (
            <div key={moduleKey} className="flex items-start gap-2">
              <Checkbox
                id={`${idPrefix}${moduleKey}`}
                checked={selectedModules.includes(moduleKey)}
                onCheckedChange={() => onToggle(moduleKey)}
                disabled={isDisabled}
              />
              <div className="flex-1">
                <Label
                  htmlFor={`${idPrefix}${moduleKey}`}
                  className={`text-sm font-medium cursor-pointer ${isDisabled ? 'text-gray-500' : ''}`}
                >
                  {module.name}
                  {isDisabled && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Обязательно
                    </Badge>
                  )}
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">{module.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
