import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useBudgetStore } from '@/stores/budgetStore';
import { useSettingsStore } from '@/stores/settingsStore';
import OrganizationBudgetPlanDialog from './OrganizationBudgetPlanDialog';

interface OrganizationBudgetPlansTableProps {
  year: number;
}

export default function OrganizationBudgetPlansTable({ year }: OrganizationBudgetPlansTableProps) {
  const { getOrganizationPlansByYear, deleteOrganizationPlan, expenses, categories } = useBudgetStore();
  const { organizations } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | undefined>();

  const plans = getOrganizationPlansByYear(year);

  const filteredPlans = plans.filter((plan) => {
    const org = organizations.find(o => o.id === plan.organizationId);
    const orgName = org?.name.toLowerCase() || '';
    return orgName.includes(searchQuery.toLowerCase());
  });

  const getOrganizationName = (id: string) => {
    return organizations.find(o => o.id === id)?.name || '—';
  };

  const getSpentAmount = (organizationId: string) => {
    return expenses
      .filter(exp => {
        const category = categories.find(c => c.id === exp.categoryId);
        return exp.organizationId === organizationId && category && category.year === year;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      draft: { label: 'Черновик', variant: 'secondary' },
      approved: { label: 'Утвержден', variant: 'default' },
      archived: { label: 'Архив', variant: 'outline' }
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleEdit = (planId: string) => {
    setEditingPlanId(planId);
    setDialogOpen(true);
  };

  const handleDelete = (planId: string) => {
    if (confirm('Удалить план бюджета?')) {
      deleteOrganizationPlan(planId);
    }
  };

  const handleAddNew = () => {
    setEditingPlanId(undefined);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPlanId(undefined);
  };

  const totalPlanned = filteredPlans.reduce((sum, p) => sum + p.totalPlannedAmount, 0);
  const totalSpent = filteredPlans.reduce((sum, p) => sum + getSpentAmount(p.organizationId), 0);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Building2" size={20} />
              Планы бюджета по организациям
            </CardTitle>
            <Button onClick={handleAddNew} className="gap-2">
              <Icon name="Plus" size={18} />
              Добавить план
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Поиск по организации..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Всего планов:</span>
                <Badge variant="outline">{filteredPlans.length}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="FileText" size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                {searchQuery ? 'Планы не найдены' : 'Планы бюджета еще не созданы'}
              </p>
              {!searchQuery && (
                <Button variant="outline" onClick={handleAddNew} className="gap-2 mt-4">
                  <Icon name="Plus" size={18} />
                  Создать первый план
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Организация</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">План</TableHead>
                    <TableHead className="text-right">Израсходовано</TableHead>
                    <TableHead className="text-right">Остаток</TableHead>
                    <TableHead className="text-center">Освоение</TableHead>
                    <TableHead>Утверждено</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => {
                    const spent = getSpentAmount(plan.organizationId);
                    const remaining = plan.totalPlannedAmount - spent;
                    const utilization = plan.totalPlannedAmount > 0
                      ? Math.round((spent / plan.totalPlannedAmount) * 100)
                      : 0;

                    return (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon name="Building2" size={16} className="text-gray-400" />
                            <span className="font-medium">{getOrganizationName(plan.organizationId)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(plan.status)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(plan.totalPlannedAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(spent)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={remaining < 0 ? 'text-red-600 font-medium' : ''}>
                            {formatCurrency(remaining)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={utilization > 100 ? 'destructive' : 'outline'}>
                            {utilization}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {plan.approvedAt ? (
                            <div className="text-sm text-gray-600">
                              {formatDate(plan.approvedAt)}
                            </div>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Icon name="MoreVertical" size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(plan.id)}>
                                <Icon name="Edit" size={16} className="mr-2" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(plan.id)}
                                className="text-red-600"
                              >
                                <Icon name="Trash2" size={16} className="mr-2" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Показано планов: {filteredPlans.length}
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Итого запланировано:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(totalPlanned)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Итого израсходовано:</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(totalSpent)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <OrganizationBudgetPlanDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        year={year}
        planId={editingPlanId}
      />
    </>
  );
}