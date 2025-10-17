import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ContractorsList from '@/modules/catalog/components/contractors/ContractorsList';
import EmployeesListFull from '@/modules/catalog/components/contractors/EmployeesListFull';
import ObjectAccessManagement from '@/modules/catalog/components/contractors/ObjectAccessManagement';
import ContractorFormDialog from '@/modules/catalog/components/contractors/ContractorFormDialog';
import EmployeeFormDialog from '@/modules/catalog/components/contractors/EmployeeFormDialog';

export default function ContractorsTab() {
  const [activeSubTab, setActiveSubTab] = useState('contractors');
  const [isContractorDialogOpen, setIsContractorDialogOpen] = useState(false);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);

  const handleCreateClick = () => {
    if (activeSubTab === 'contractors') {
      setIsContractorDialogOpen(true);
    } else if (activeSubTab === 'employees') {
      setIsEmployeeDialogOpen(true);
    }
  };

  const getCreateButtonText = () => {
    switch (activeSubTab) {
      case 'contractors':
        return 'Добавить подрядчика';
      case 'employees':
        return 'Добавить сотрудника';
      case 'access':
        return 'Назначить на объект';
      default:
        return 'Добавить';
    }
  };

  const getCreateButtonIcon = () => {
    switch (activeSubTab) {
      case 'contractors':
        return 'Building2';
      case 'employees':
        return 'UserPlus';
      case 'access':
        return 'KeyRound';
      default:
        return 'Plus';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Подрядчики на объектах</h2>
          <p className="text-muted-foreground mt-1">
            Реестр подрядных организаций, персонала и контроль доступа к объектам
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Icon name={getCreateButtonIcon()} className="mr-2" size={18} />
          {getCreateButtonText()}
        </Button>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList>
          <TabsTrigger value="contractors" className="gap-2">
            <Icon name="Building2" size={16} />
            Организации
          </TabsTrigger>
          <TabsTrigger value="employees" className="gap-2">
            <Icon name="Users" size={16} />
            Персонал
          </TabsTrigger>
          <TabsTrigger value="access" className="gap-2">
            <Icon name="ShieldCheck" size={16} />
            Доступ к объектам
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contractors" className="space-y-4 mt-4">
          <ContractorsList />
        </TabsContent>

        <TabsContent value="employees" className="space-y-4 mt-4">
          <EmployeesListFull />
        </TabsContent>

        <TabsContent value="access" className="space-y-4 mt-4">
          <ObjectAccessManagement />
        </TabsContent>
      </Tabs>

      <ContractorFormDialog
        open={isContractorDialogOpen}
        onOpenChange={setIsContractorDialogOpen}
      />
      
      <EmployeeFormDialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
      />
    </div>
  );
}
