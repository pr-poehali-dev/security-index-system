import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { CERTIFICATION_CATEGORIES, CERTIFICATION_AREAS_BY_CATEGORY } from '@/lib/constants';
import type { CompetencyMatrix, CompetencyAreaRequirement } from '@/types';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';

interface EditCompetencyDialogProps {
  competency: CompetencyMatrix;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditCompetencyDialog({ competency, open, onOpenChange }: EditCompetencyDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { updateCompetency, getOrganizationsByTenant } = useSettingsStore();
  const { toast } = useToast();

  const organizations = user?.tenantId ? getOrganizationsByTenant(user.tenantId) : [];

  const [formData, setFormData] = useState({
    organizationId: competency.organizationId,
    position: competency.position
  });

  const [requirements, setRequirements] = useState<CompetencyAreaRequirement[]>(competency.requiredAreas);

  useEffect(() => {
    setFormData({
      organizationId: competency.organizationId,
      position: competency.position
    });
    setRequirements(competency.requiredAreas);
  }, [competency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.organizationId || !formData.position) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    if (requirements.length === 0 || requirements.every(r => r.areas.length === 0)) {
      toast({
        title: 'Ошибка',
        description: 'Выберите хотя бы одну область аттестации',
        variant: 'destructive'
      });
      return;
    }

    const filteredRequirements = requirements.filter(r => r.areas.length > 0);

    updateCompetency(competency.id, {
      organizationId: formData.organizationId,
      position: formData.position,
      requiredAreas: filteredRequirements
    });

    toast({ title: 'Запись обновлена' });
    onOpenChange(false);
  };

  const handleCategoryToggle = (categoryValue: string, checked: boolean) => {
    if (checked) {
      setRequirements([...requirements, { 
        category: categoryValue as any, 
        areas: [] 
      }]);
    } else {
      setRequirements(requirements.filter(r => r.category !== categoryValue));
    }
  };

  const handleAreaToggle = (categoryValue: string, areaCode: string, checked: boolean) => {
    setRequirements(requirements.map(req => {
      if (req.category === categoryValue) {
        return {
          ...req,
          areas: checked 
            ? [...req.areas, areaCode]
            : req.areas.filter(a => a !== areaCode)
        };
      }
      return req;
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать запись</DialogTitle>
          <DialogDescription>
            Измените требования по аттестации для должности
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="organizationId">
                Организация <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.organizationId}
                onValueChange={(value) => setFormData({ ...formData, organizationId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите организацию" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">
                Должность <span className="text-red-500">*</span>
              </Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Например: Главный инженер"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base">
              Требуемые области аттестации <span className="text-red-500">*</span>
            </Label>

            {CERTIFICATION_CATEGORIES.map((category) => {
              const isSelected = requirements.some(r => r.category === category.value);
              const selectedAreas = requirements.find(r => r.category === category.value)?.areas || [];
              const availableAreas = CERTIFICATION_AREAS_BY_CATEGORY[category.value as keyof typeof CERTIFICATION_AREAS_BY_CATEGORY] || [];

              return (
                <Card key={category.value} className={isSelected ? 'border-purple-500' : ''}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`cat-${category.value}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleCategoryToggle(category.value, !!checked)}
                      />
                      <Label htmlFor={`cat-${category.value}`} className="font-semibold cursor-pointer">
                        {category.label} ({category.code})
                      </Label>
                    </div>

                    {isSelected && (
                      <div className="ml-6 space-y-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          Выберите области:
                        </p>
                        <div className="grid gap-2 md:grid-cols-2">
                          {availableAreas.map((area) => (
                            <div key={area.code} className="flex items-center gap-2">
                              <Checkbox
                                id={`area-${category.value}-${area.code}`}
                                checked={selectedAreas.includes(area.code)}
                                onCheckedChange={(checked) => 
                                  handleAreaToggle(category.value, area.code, !!checked)
                                }
                              />
                              <Label 
                                htmlFor={`area-${category.value}-${area.code}`}
                                className="text-sm cursor-pointer"
                              >
                                {area.code} - {area.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" className="gap-2">
              <Icon name="Save" size={16} />
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
