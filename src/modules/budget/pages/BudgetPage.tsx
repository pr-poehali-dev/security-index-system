// src/modules/budget/pages/BudgetPage.tsx
// Описание: Страница бюджета - планирование расходов и аналитика
import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useBudgetStore } from '@/stores/budgetStore';
import BudgetAnalytics from '../components/BudgetAnalytics';
import ExpenseHistoryTable from '../components/ExpenseHistoryTable';
import AddExpenseDialog from '../components/AddExpenseDialog';
import BudgetCategoriesDialog from '../components/BudgetCategoriesDialog';
import OrganizationBudgetPlansTable from '../components/OrganizationBudgetPlansTable';

const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear, currentYear + 1];

export default function BudgetPage() {
  const { selectedYear, setSelectedYear } = useBudgetStore();
  const [currentTab, setCurrentTab] = useState('overview');
  const [addExpenseDialogOpen, setAddExpenseDialogOpen] = useState(false);
  const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Планирование бюджета"
        description="Управление бюджетом и контроль расходов на мероприятия по безопасности"
        icon="Wallet"
        action={
          <div className="flex gap-2">
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(v) => setSelectedYear(parseInt(v))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year} год
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setCategoriesDialogOpen(true)}
            >
              <Icon name="Settings" size={18} />
              Статьи бюджета
            </Button>

            <Button 
              className="gap-2"
              onClick={() => setAddExpenseDialogOpen(true)}
            >
              <Icon name="Plus" size={18} />
              Добавить расход
            </Button>
          </div>
        }
      />

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="overview" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="PieChart" size={20} />
            <span className="text-xs font-medium">Обзор</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Building2" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Планы<br/>организаций</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="List" size={20} />
            <span className="text-xs font-medium text-center leading-tight">История<br/>расходов</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <BudgetAnalytics year={selectedYear} />
        </TabsContent>

        <TabsContent value="plans">
          <OrganizationBudgetPlansTable year={selectedYear} />
        </TabsContent>

        <TabsContent value="history">
          <ExpenseHistoryTable year={selectedYear} />
        </TabsContent>
      </Tabs>

      <AddExpenseDialog
        open={addExpenseDialogOpen}
        onClose={() => setAddExpenseDialogOpen(false)}
        year={selectedYear}
      />

      <BudgetCategoriesDialog
        open={categoriesDialogOpen}
        onClose={() => setCategoriesDialogOpen(false)}
        year={selectedYear}
      />
    </div>
  );
}