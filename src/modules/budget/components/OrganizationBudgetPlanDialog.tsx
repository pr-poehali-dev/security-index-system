import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useBudgetStore } from '@/stores/budgetStore';
import { useOrganizationsStore } from '@/stores/organizationsStore';
import type { OrganizationBudgetPlan, OrganizationBudgetCategory } from '@/types';

interface OrganizationBudgetPlanDialogProps {
  open: boolean;
  onClose: () => void;
  year: number;
  organizationId?: string;
  planId?: string;
}

export default function OrganizationBudgetPlanDialog({
  open,
  onClose,
  year,
  organizationId: initialOrgId,
  planId
}: OrganizationBudgetPlanDialogProps) {
  const { 
    categories, 
    getCategoriesByYear, 
    addOrganizationPlan, 
    updateOrganizationPlan,
    organizationPlans 
  } = useBudgetStore();
  const { organizations } = useOrganizationsStore();

  const [organizationId, setOrganizationId] = useState(initialOrgId || '');
  const [status, setStatus] = useState<'draft' | 'approved' | 'archived'>('draft');
  const [budgetCategories, setBudgetCategories] = useState<OrganizationBudgetCategory[]>([]);

  const existingPlan = planId ? organizationPlans.find(p => p.id === planId) : null;
  const yearCategories = getCategoriesByYear(year);

  useEffect(() => {
    if (existingPlan) {
      setOrganizationId(existingPlan.organizationId);
      setStatus(existingPlan.status);
      setBudgetCategories(existingPlan.categories);
    } else {
      setBudgetCategories(
        yearCategories.map(cat => ({
          categoryId: cat.id,
          plannedAmount: 0,
          description: ''
        }))
      );
    }
  }, [existingPlan, open]);

  const handleAmountChange = (categoryId: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setBudgetCategories(prev =>
      prev.map(cat =>
        cat.categoryId === categoryId ? { ...cat, plannedAmount: amount } : cat
      )
    );
  };

  const handleDescriptionChange = (categoryId: string, value: string) => {
    setBudgetCategories(prev =>
      prev.map(cat =>
        cat.categoryId === categoryId ? { ...cat, description: value } : cat
      )
    );
  };

  const totalPlanned = budgetCategories.reduce((sum, cat) => sum + cat.plannedAmount, 0);

  const handleSubmit = () => {
    if (!organizationId) return;

    const planData: Omit<OrganizationBudgetPlan, 'id' | 'createdAt' | 'updatedAt'> = {
      tenantId: 'tenant-1',
      organizationId,
      year,
      totalPlannedAmount: totalPlanned,
      status,
      categories: budgetCategories.filter(cat => cat.plannedAmount > 0),
      createdBy: 'user-1',
      approvedBy: status === 'approved' ? 'user-1' : undefined,
      approvedAt: status === 'approved' ? new Date().toISOString() : undefined
    };

    if (existingPlan) {
      updateOrganizationPlan(existingPlan.id, planData);
    } else {
      addOrganizationPlan(planData);
    }

    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingPlan ? 'Редактировать план бюджета' : 'Новый план бюджета организации'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Организация</Label>
              <Select value={organizationId} onValueChange={setOrganizationId} disabled={!!existingPlan}>
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
              <Label>Статус плана</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Черновик</SelectItem>
                  <SelectItem value="approved">Утвержден</SelectItem>
                  <SelectItem value="archived">Архив</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon name="Calculator" size={20} />
                  <span className="font-medium">Общая сумма плана:</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalPlanned)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Icon name="Calendar" size={16} />
                <span>Плановый год: {year}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Распределение по статьям бюджета</Label>
              <Badge variant="outline">
                {budgetCategories.filter(c => c.plannedAmount > 0).length} из {yearCategories.length}
              </Badge>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {budgetCategories.map((budgetCat) => {
                const category = getCategoryById(budgetCat.categoryId);
                if (!category) return null;

                return (
                  <Card key={budgetCat.categoryId}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: category.color }}
                            />
                            <div>
                              <div className="font-medium">{category.name}</div>
                              {category.description && (
                                <div className="text-sm text-gray-600">{category.description}</div>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Лимит: {formatCurrency(category.plannedAmount)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Плановая сумма (₽)</Label>
                            <Input
                              type="number"
                              value={budgetCat.plannedAmount || ''}
                              onChange={(e) => handleAmountChange(budgetCat.categoryId, e.target.value)}
                              placeholder="0"
                              min="0"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs text-gray-600">Примечание (опционально)</Label>
                            <Input
                              value={budgetCat.description || ''}
                              onChange={(e) => handleDescriptionChange(budgetCat.categoryId, e.target.value)}
                              placeholder="Детали распределения"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отменить
          </Button>
          <Button onClick={handleSubmit} disabled={!organizationId || totalPlanned === 0}>
            {existingPlan ? 'Сохранить изменения' : 'Создать план'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}