import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ContractorsList from '@/modules/catalog/components/contractors/ContractorsList';
import ContractorFormDialog from '@/modules/catalog/components/contractors/ContractorFormDialog';

export default function ContractorsTab() {
  const [isContractorDialogOpen, setIsContractorDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Учебные центры</h2>
          <p className="text-muted-foreground mt-1">
            Реестр учебных центров для организации обучения и аттестации персонала
          </p>
        </div>
        <Button onClick={() => setIsContractorDialogOpen(true)}>
          <Icon name="Building2" className="mr-2" size={18} />
          Добавить учебный центр
        </Button>
      </div>

      <ContractorsList filterByType="training_center" />

      <ContractorFormDialog
        open={isContractorDialogOpen}
        onOpenChange={setIsContractorDialogOpen}
      />
    </div>
  );
}