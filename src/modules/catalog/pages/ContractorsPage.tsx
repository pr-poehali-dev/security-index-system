// src/modules/catalog/pages/ContractorsPage.tsx
// Описание: Страница управления подрядчиками, их сотрудниками и доступами
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ContractorsList from '../components/contractors/ContractorsList';
import EmployeesListFull from '../components/contractors/EmployeesListFull';
import ObjectAccessManagement from '../components/contractors/ObjectAccessManagement';
import ContractorFormDialog from '../components/contractors/ContractorFormDialog';
import EmployeeFormDialog from '../components/contractors/EmployeeFormDialog';

const ContractorsPage = () => {
  const [activeTab, setActiveTab] = useState('contractors');
  const [isContractorDialogOpen, setIsContractorDialogOpen] = useState(false);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);

  const handleCreateClick = () => {
    if (activeTab === 'contractors') {
      setIsContractorDialogOpen(true);
    } else if (activeTab === 'employees') {
      setIsEmployeeDialogOpen(true);
    }
  };

  const getCreateButtonText = () => {
    switch (activeTab) {
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
    switch (activeTab) {
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление подрядчиками</h1>
          <p className="text-muted-foreground mt-1">
            Реестр подрядных организаций, персонала и контроль доступа к объектам
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Icon name={getCreateButtonIcon()} className="mr-2" size={18} />
          {getCreateButtonText()}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="contractors" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Building2" size={20} />
            <span className="text-xs font-medium">Организации</span>
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="Users" size={20} />
            <span className="text-xs font-medium">Персонал</span>
          </TabsTrigger>
          <TabsTrigger value="access" className="flex-col gap-2 h-20 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Icon name="ShieldCheck" size={20} />
            <span className="text-xs font-medium text-center leading-tight">Доступ<br/>к объектам</span>
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
};

export default ContractorsPage;