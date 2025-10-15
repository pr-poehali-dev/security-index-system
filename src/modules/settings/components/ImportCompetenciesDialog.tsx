import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import * as XLSX from 'xlsx';
import type { CompetencyAreaRequirement } from '@/types';
import { CERTIFICATION_CATEGORIES } from '@/lib/constants';

interface ImportCompetenciesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CompetencyImportRow {
  'Организация': string;
  'Должность': string;
  'Требуемые области аттестации': string;
}

export default function ImportCompetenciesDialog({ open, onOpenChange }: ImportCompetenciesDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { importCompetencies, getOrganizationsByTenant } = useSettingsStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const organizations = user?.tenantId ? getOrganizationsByTenant(user.tenantId) : [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.tenantId) return;

    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<CompetencyImportRow>(worksheet);

      const competencies = jsonData
        .map((row) => {
          const orgName = row['Организация']?.toString().trim();
          const position = row['Должность']?.toString().trim();
          const areasStr = row['Требуемые области аттестации']?.toString().trim();

          if (!orgName || !position || !areasStr) return null;

          const org = organizations.find((o) => o.name === orgName);
          if (!org) return null;

          const requiredAreas: CompetencyAreaRequirement[] = [];
          const categoryParts = areasStr.split('|').map(s => s.trim());

          categoryParts.forEach((part) => {
            const match = part.match(/^(.+?):\s*(.+)$/);
            if (match) {
              const categoryLabel = match[1].trim();
              const areasList = match[2].split(',').map(a => a.trim());

              const category = CERTIFICATION_CATEGORIES.find(c => c.label === categoryLabel);
              if (category) {
                requiredAreas.push({
                  category: category.value as 'industrial_safety' | 'energy_safety' | 'labor_safety' | 'ecology',
                  areas: areasList
                });
              }
            }
          });

          if (requiredAreas.length === 0) return null;

          return {
            tenantId: user.tenantId!,
            organizationId: org.id,
            position,
            requiredAreas
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (competencies.length > 0) {
        importCompetencies(competencies);
        toast({
          title: 'Импорт завершен',
          description: `Импортировано записей: ${competencies.length}`
        });
        onOpenChange(false);
      } else {
        toast({
          title: 'Ошибка импорта',
          description: 'Не найдено корректных данных для импорта',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка импорта',
        description: 'Проверьте формат файла',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Организация': 'ООО "Пример"',
        'Должность': 'Главный инженер',
        'Требуемые области аттестации': 'Промышленная безопасность: Б.1, Б.2 | Энергобезопасность: ЭБ.1'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Шаблон');
    XLSX.writeFile(wb, 'Шаблон_импорта_компетенций.xlsx');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Импорт компетенций</DialogTitle>
          <DialogDescription>
            Загрузите Excel файл с данными для массового импорта
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="Info" className="text-blue-600 mt-0.5" size={18} />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                  Формат файла:
                </p>
                <ul className="text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                  <li>Организация (название должно совпадать с существующей)</li>
                  <li>Должность</li>
                  <li>Требуемые области аттестации (формат: "Категория: Код1, Код2 | Категория2: Код3")</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">Файл Excel</Label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={downloadTemplate}
              className="gap-2"
            >
              <Icon name="Download" size={16} />
              Скачать шаблон
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}