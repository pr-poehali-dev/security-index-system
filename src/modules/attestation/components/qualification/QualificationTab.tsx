import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import QualificationCertificatesList from './QualificationCertificatesList';
import AddQualificationDialog from './AddQualificationDialog';

interface QualificationTabProps {
  employeeId: string;
  employeeName: string;
  organization: string;
  position: string;
  department: string;
}

export default function QualificationTab({
  employeeId,
  employeeName,
  organization,
  position,
  department,
}: QualificationTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="pb-4 border-b">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{employeeName}</h3>
            <p className="text-sm text-muted-foreground mb-1">
              <Icon name="Building2" size={14} className="inline mr-1" />
              {organization}
            </p>
            <p className="text-sm text-muted-foreground">
              {position} • {department}
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить удостоверение
          </Button>
        </div>
      </div>

      <QualificationCertificatesList employeeId={employeeId} />

      <AddQualificationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        employeeId={employeeId}
      />
    </div>
  );
}
